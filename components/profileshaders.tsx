import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import visuallyHidden from '@mui/utils/visuallyHidden';
import useShaderSerDe from 'lib/db/serializeshader';
import { SUPABASE_SHADERTHUMB_BUCKET_NAME } from 'lib/db/supabaseclient';
import { toDateString, toUnixTime } from 'lib/util/dateutils';
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
    align: 'left' | 'right' | 'inherit' | 'center' | 'justify';
    unsortable: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'thumb_url',
        align: 'left',
        disablePadding: false,
        label: 'Preview',
        unsortable: true
    },
    {
        id: 'name',
        align: 'left',
        disablePadding: true,
        label: 'Name',
        unsortable: false
    },
    {
        id: 'created_at',
        align: 'left',
        disablePadding: false,
        label: 'Date',
        unsortable: false
    },
    {
        id: 'visibility',
        align: 'left',
        disablePadding: false,
        label: 'Visibility',
        unsortable: false
    },
    {
        id: null, // null hided when editable
        align: 'left',
        disablePadding: false,
        label: 'Actions',
        unsortable: true
    }
];

interface EnhancedTableProps {
    onRequestSort: (event: MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
    editable: boolean;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort, editable } = props;
    const createSortHandler = (property: keyof Data) => (event: MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map(headCell =>
                    editable || headCell.id ? (
                        headCell.unsortable ? (
                            <TableCell
                                key={headCell.id}
                                align={headCell.align}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                                sortDirection={false}
                            >
                                {headCell.label}
                            </TableCell>
                        ) : (
                            <TableCell
                                key={headCell.id}
                                align={headCell.align}
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
                    ) : null
                )}
            </TableRow>
        </TableHead>
    );
}

const EnhancedTableToolbar = () => {
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

export const ProfileShaders = props => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('created_at');

    const handleRequestSort = (event: MouseEvent<unknown>, property: keyof Data) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const [, , deleteShader] = useShaderSerDe();
    const [isRemoved, setIsRemoved] = useState({ index: null });
    const handleDeleteShader = (row, index) => {
        if (confirm('Are you sure you want to delete this shader?')) {
            deleteShader(row.id);
            setIsRemoved({ index });
        }
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
                            editable={props.editable}
                        />
                        <TableBody>
                            {props.rows
                                .slice()
                                .sort(getComparator(order, orderBy))
                                .map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return !(isRemoved.index === index) ? (
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
                                            <TableCell align="left">
                                                {toDateString(row.created_at)}
                                            </TableCell>
                                            <TableCell align="left">{row.visibility}</TableCell>
                                            {props.editable ? (
                                                <TableCell align="left">
                                                    <Button
                                                        onClick={() =>
                                                            handleDeleteShader(row, index)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            ) : null}
                                        </TableRow>
                                    ) : null;
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};
