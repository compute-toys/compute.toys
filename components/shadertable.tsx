import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { SUPABASE_SHADERTHUMB_BUCKET_NAME } from 'lib/db/supabaseclient';
import { toUnixTime } from 'lib/util/dateutils';
import { getFullyQualifiedSupabaseBucketURL } from 'lib/util/urlutils';
import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent, useState } from 'react';

interface Data {
    name: string;
    visibility: string;
    thumb_url: string;
    created_at: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (orderBy === 'created_at') {
        // this is slow, preferable to do this upfront
        const time_b = toUnixTime(b[orderBy] as unknown as string);
        const time_a = toUnixTime(a[orderBy] as unknown as string);
        if (time_b < time_a) {
            return -1;
        }
        if (time_b > time_a) {
            return 1;
        }
    } else {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
    }

    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
    unsortable: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'thumb_url',
        numeric: false,
        disablePadding: false,
        label: 'Preview',
        unsortable: true
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
        unsortable: false
    },
    {
        id: 'created_at',
        numeric: false,
        disablePadding: false,
        label: 'Date',
        unsortable: false
    },
    {
        id: 'visibility',
        numeric: false,
        disablePadding: false,
        label: 'Visibility',
        unsortable: false
    }
];

interface EnhancedTableProps {
    onRequestSort: (event: MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property: keyof Data) => (event: MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map(headCell =>
                    headCell.unsortable ? (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={false}
                        >
                            {headCell.label}
                        </TableCell>
                    ) : (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc'
                                            ? 'sorted descending'
                                            : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    )
                )}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarProps {}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                minHeight: '32px !important',
                height: '32px',
                marginTop: '32px'
            }}
        >
            <Typography variant="h6" id="tableTitle">
                Shaders
            </Typography>
        </Toolbar>
    );
};

const TABLE_PREVIEW_WIDTH = 48;
const TABLE_PREVIEW_HEIGHT = 27;

export const ShaderTable = props => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('created_at');

    const handleRequestSort = (event: MouseEvent<unknown>, property: keyof Data) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar />
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'small'}>
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {props.rows
                                .slice()
                                .sort(getComparator(order, orderBy))
                                .map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow hover tabIndex={-1} key={row.name}>
                                            <TableCell align="left">
                                                <Image
                                                    height={TABLE_PREVIEW_HEIGHT}
                                                    width={TABLE_PREVIEW_WIDTH}
                                                    src={getFullyQualifiedSupabaseBucketURL(
                                                        SUPABASE_SHADERTHUMB_BUCKET_NAME,
                                                        row.thumb_url
                                                    )}
                                                    alt={row.name}
                                                />
                                            </TableCell>
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                padding="none"
                                            >
                                                <Link href={`/view/${row.id}`}>{row.name}</Link>
                                            </TableCell>

                                            <TableCell align="left">{row.created_at}</TableCell>
                                            <TableCell align="left">{row.visibility}</TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};
