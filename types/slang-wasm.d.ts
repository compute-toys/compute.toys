// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    namespace FS {
        export let root: any;
        export let mounts: any[];
        export let devices: {};
        export let streams: any[];
        export let nextInode: number;
        export let nameTable: any;
        export let currentPath: string;
        export let initialized: boolean;
        export let ignorePermissions: boolean;
        export { ErrnoError };
        export let filesystems: any;
        export let syncFSRequests: number;
        export let readFiles: {};
        export { FSStream };
        export { FSNode };
        export function lookupPath(path: any, opts?: {}): {
            path: string;
            node?: undefined;
        } | {
            path: string;
            node: any;
        };
        export function getPath(node: any): any;
        export function hashName(parentid: any, name: any): number;
        export function hashAddNode(node: any): void;
        export function hashRemoveNode(node: any): void;
        export function lookupNode(parent: any, name: any): any;
        export function createNode(parent: any, name: any, mode: any, rdev: any): any;
        export function destroyNode(node: any): void;
        export function isRoot(node: any): boolean;
        export function isMountpoint(node: any): boolean;
        export function isFile(mode: any): boolean;
        export function isDir(mode: any): boolean;
        export function isLink(mode: any): boolean;
        export function isChrdev(mode: any): boolean;
        export function isBlkdev(mode: any): boolean;
        export function isFIFO(mode: any): boolean;
        export function isSocket(mode: any): boolean;
        export function flagsToPermissionString(flag: any): string;
        export function nodePermissions(node: any, perms: any): 0 | 2;
        export function mayLookup(dir: any): any;
        export function mayCreate(dir: any, name: any): any;
        export function mayDelete(dir: any, name: any, isdir: any): any;
        export function mayOpen(node: any, flags: any): any;
        export function checkOpExists(op: any, err: any): any;
        export let MAX_OPEN_FDS: number;
        export function nextfd(): number;
        export function getStreamChecked(fd: any): any;
        export function getStream(fd: any): any;
        export function createStream(stream: any, fd?: number): any;
        export function closeStream(fd: any): void;
        export function dupStream(origStream: any, fd?: number): any;
        export function doSetAttr(stream: any, node: any, attr: any): void;
        export namespace chrdev_stream_ops {
            function open(stream: any): void;
            function llseek(): never;
        }
        export function major(dev: any): number;
        export function minor(dev: any): number;
        export function makedev(ma: any, mi: any): number;
        export function registerDevice(dev: any, ops: any): void;
        export function getDevice(dev: any): any;
        export function getMounts(mount: any): any[];
        export function syncfs(populate: any, callback: any): void;
        export function mount(type: any, opts: any, mountpoint: any): any;
        export function unmount(mountpoint: any): void;
        export function lookup(parent: any, name: any): any;
        export function mknod(path: any, mode: any, dev: any): any;
        export function statfs(path: any): any;
        export function statfsStream(stream: any): any;
        export function statfsNode(node: any): {
            bsize: number;
            frsize: number;
            blocks: number;
            bfree: number;
            bavail: number;
            files: any;
            ffree: number;
            fsid: number;
            flags: number;
            namelen: number;
        };
        export function create(path: any, mode?: number): any;
        export function mkdir(path: any, mode?: number): any;
        export function mkdirTree(path: any, mode: any): void;
        export function mkdev(path: any, mode: any, dev: any): any;
        export function symlink(oldpath: any, newpath: any): any;
        export function rename(old_path: any, new_path: any): void;
        export function rmdir(path: any): void;
        export function readdir(path: any): any;
        export function unlink(path: any): void;
        export function readlink(path: any): any;
        export function stat(path: any, dontFollow: any): any;
        export function fstat(fd: any): any;
        export function lstat(path: any): any;
        export function doChmod(stream: any, node: any, mode: any, dontFollow: any): void;
        export function chmod(path: any, mode: any, dontFollow: any): void;
        export function lchmod(path: any, mode: any): void;
        export function fchmod(fd: any, mode: any): void;
        export function doChown(stream: any, node: any, dontFollow: any): void;
        export function chown(path: any, uid: any, gid: any, dontFollow: any): void;
        export function lchown(path: any, uid: any, gid: any): void;
        export function fchown(fd: any, uid: any, gid: any): void;
        export function doTruncate(stream: any, node: any, len: any): void;
        export function truncate(path: any, len: any): void;
        export function ftruncate(fd: any, len: any): void;
        export function utime(path: any, atime: any, mtime: any): void;
        export function open(path: any, flags: any, mode?: number): any;
        export function close(stream: any): void;
        export function isClosed(stream: any): boolean;
        export function llseek(stream: any, offset: any, whence: any): any;
        export function read(stream: any, buffer: any, offset: any, length: any, position: any): any;
        export function write(stream: any, buffer: any, offset: any, length: any, position: any, canOwn: any): any;
        export function allocate(stream: any, offset: any, length: any): void;
        export function mmap(stream: any, length: any, position: any, prot: any, flags: any): any;
        export function msync(stream: any, buffer: any, offset: any, length: any, mmapFlags: any): any;
        export function ioctl(stream: any, cmd: any, arg: any): any;
        export function readFile(path: any, opts?: {}): any;
        export function writeFile(path: any, data: any, opts?: {}): void;
        export function cwd(): any;
        export function chdir(path: any): void;
        export function createDefaultDirectories(): void;
        export function createDefaultDevices(): void;
        export function createSpecialDirectories(): void;
        export function createStandardStreams(input: any, output: any, error: any): void;
        export function staticInit(): void;
        export function init(input: any, output: any, error: any): void;
        export function quit(): void;
        export function findObject(path: any, dontResolveLastLink: any): any;
        export function analyzePath(path: any, dontResolveLastLink: any): {
            isRoot: boolean;
            exists: boolean;
            error: number;
            name: any;
            path: any;
            object: any;
            parentExists: boolean;
            parentPath: any;
            parentObject: any;
        };
        export function createPath(parent: any, path: any, canRead: any, canWrite: any): any;
        export function createFile(parent: any, name: any, properties: any, canRead: any, canWrite: any): any;
        export function createDataFile(parent: any, name: any, data: any, canRead: any, canWrite: any, canOwn: any): void;
        export function createDevice(parent: any, name: any, input: any, output: any): any;
        export function forceLoadFile(obj: any): boolean;
        export function createLazyFile(parent: any, name: any, url: any, canRead: any, canWrite: any): any;
        export function absolutePath(): void;
        export function createFolder(): void;
        export function createLink(): void;
        export function joinPath(): void;
        export function mmapAlloc(): void;
        export function standardizePath(): void;
    }
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
}
declare class ErrnoError extends Error {
    constructor(errno: any);
    errno: any;
    code: string;
}
declare class FSStream {
    shared: {};
    set object(val: any);
    get object(): any;
    node: any;
    get isRead(): boolean;
    get isWrite(): boolean;
    get isAppend(): number;
    set flags(val: any);
    get flags(): any;
    set position(val: any);
    get position(): any;
}
declare class FSNode {
    constructor(parent: any, name: any, mode: any, rdev: any);
    node_ops: {};
    stream_ops: {};
    readMode: number;
    writeMode: number;
    mounted: any;
    parent: any;
    mount: any;
    id: number;
    name: any;
    mode: any;
    rdev: any;
    atime: number;
    mtime: number;
    ctime: number;
    set read(val: boolean);
    get read(): boolean;
    set write(val: boolean);
    get write(): boolean;
    get isFolder(): any;
    get isDevice(): any;
}
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export interface ClassHandle {
  isAliasOf(other: ClassHandle): boolean;
  delete(): void;
  deleteLater(): this;
  isDeleted(): boolean;
  clone(): this;
}
export interface GlobalSession extends ClassHandle {
  createSession(_0: number): Session | null;
}

export interface Session extends ClassHandle {
  loadModuleFromSource(_0: EmbindString, _1: EmbindString, _2: EmbindString): any;
  createCompositeComponentType(_0: any): any;
}

export interface ComponentType extends ClassHandle {
  getLayout(_0: number): ProgramLayout | null;
  getEntryPointCode(_0: number, _1: number): string;
  getTargetCode(_0: number): string;
  link(): any;
  getEntryPointCodeBlob(_0: number, _1: number): any;
  getTargetCodeBlob(_0: number): any;
  loadStrings(): any;
}

export interface TypeLayoutReflection extends ClassHandle {
  getDescriptorSetDescriptorRangeType(_0: number, _1: number): BindingType;
}

export interface ModifierIDValue<T extends number> {
  value: T;
}
export type ModifierID = ModifierIDValue<0>|ModifierIDValue<1>|ModifierIDValue<2>|ModifierIDValue<3>|ModifierIDValue<4>|ModifierIDValue<5>|ModifierIDValue<6>|ModifierIDValue<7>|ModifierIDValue<8>|ModifierIDValue<9>|ModifierIDValue<10>;

export interface Modifier extends ClassHandle {
}

export interface VariableReflection extends ClassHandle {
  findModifier(_0: ModifierID): Modifier | null;
  getType(): TypeReflection | null;
  hasDefaultValue(): boolean;
  getUserAttributeCount(): number;
  getUserAttributeByIndex(_0: number): UserAttribute | null;
  getName(): string;
}

export interface VariableLayoutReflection extends ClassHandle {
  getTypeLayout(): TypeLayoutReflection | null;
  getBindingIndex(): number;
  getName(): string;
}

export interface GenericReflection extends ClassHandle {
  getOuterGenericContainer(): GenericReflection | null;
  getInnerKind(): SlangDeclKind;
  asDecl(): DeclReflection | null;
  getInnerDecl(): DeclReflection | null;
  getTypeParameterCount(): number;
  getValueParameterCount(): number;
  getTypeParameter(_0: number): VariableReflection | null;
  getValueParameter(_0: number): VariableReflection | null;
  getName(): string;
}

export interface SlangDeclKindValue<T extends number> {
  value: T;
}
export type SlangDeclKind = SlangDeclKindValue<0>|SlangDeclKindValue<1>|SlangDeclKindValue<2>|SlangDeclKindValue<3>|SlangDeclKindValue<4>|SlangDeclKindValue<5>|SlangDeclKindValue<6>;

export interface DeclReflection extends ClassHandle {
  asVariable(): VariableReflection | null;
  asGeneric(): GenericReflection | null;
  getParent(): DeclReflection | null;
  getKind(): DeclReflectionKind;
  getType(): TypeReflection | null;
  asFunction(): FunctionReflection | null;
  getChildrenCount(): number;
  getChild(_0: number): DeclReflection | null;
  getName(): string;
}

export interface DeclReflectionKindValue<T extends number> {
  value: T;
}
export type DeclReflectionKind = DeclReflectionKindValue<0>|DeclReflectionKindValue<1>|DeclReflectionKindValue<2>|DeclReflectionKindValue<3>|DeclReflectionKindValue<4>|DeclReflectionKindValue<5>|DeclReflectionKindValue<6>;

export interface ScalarTypeValue<T extends number> {
  value: T;
}
export type ScalarType = ScalarTypeValue<0>|ScalarTypeValue<1>|ScalarTypeValue<2>|ScalarTypeValue<3>|ScalarTypeValue<4>|ScalarTypeValue<5>|ScalarTypeValue<6>|ScalarTypeValue<7>|ScalarTypeValue<8>|ScalarTypeValue<9>|ScalarTypeValue<10>|ScalarTypeValue<11>|ScalarTypeValue<12>|ScalarTypeValue<13>;

export interface TypeReflection extends ClassHandle {
  getScalarType(): ScalarType;
  getKind(): TypeReflectionKind;
}

export interface TypeReflectionKindValue<T extends number> {
  value: T;
}
export type TypeReflectionKind = TypeReflectionKindValue<0>|TypeReflectionKindValue<1>|TypeReflectionKindValue<2>|TypeReflectionKindValue<3>|TypeReflectionKindValue<4>|TypeReflectionKindValue<5>|TypeReflectionKindValue<6>|TypeReflectionKindValue<7>|TypeReflectionKindValue<8>|TypeReflectionKindValue<9>|TypeReflectionKindValue<10>|TypeReflectionKindValue<11>|TypeReflectionKindValue<12>|TypeReflectionKindValue<13>|TypeReflectionKindValue<14>|TypeReflectionKindValue<16>|TypeReflectionKindValue<17>|TypeReflectionKindValue<18>|TypeReflectionKindValue<19>;

export interface UserAttribute extends ClassHandle {
  getArgumentCount(): number;
  getArgumentType(_0: number): TypeReflection | null;
  getArgumentValueFloat(_0: number): number;
  getName(): string;
  getArgumentValueString(_0: number): string;
}

export interface FunctionReflection extends ClassHandle {
  getUserAttributeCount(): number;
  getUserAttributeByIndex(_0: number): UserAttribute | null;
  getName(): string;
}

export interface EntryPointReflection extends ClassHandle {
  getComputeThreadGroupSize(): ThreadGroupSize;
}

export interface ThreadGroupSize extends ClassHandle {
  x: number;
  y: number;
  z: number;
}

export interface ProgramLayout extends ClassHandle {
  getGlobalParamsTypeLayout(): TypeLayoutReflection | null;
  getParameterCount(): number;
  getParameterByIndex(_0: number): VariableLayoutReflection | null;
  findEntryPointByName(_0: EmbindString): EntryPointReflection | null;
  findFunctionByName(_0: EmbindString): FunctionReflection | null;
  toJsonObject(): any;
}

export interface BindingTypeValue<T extends number> {
  value: T;
}
export type BindingType = BindingTypeValue<0>|BindingTypeValue<2>|BindingTypeValue<3>|BindingTypeValue<262>|BindingTypeValue<261>|BindingTypeValue<258>;

export interface Module extends ComponentType {
  getDefinedEntryPointCount(): number;
  findEntryPointByName(_0: EmbindString): any;
  findAndCheckEntryPoint(_0: EmbindString, _1: number): any;
  getDefinedEntryPoint(_0: number): any;
}

export interface EntryPoint extends ComponentType {
  getName(): string;
}

export interface StringList extends ClassHandle {
  size(): number;
  get(_0: number): EmbindString | undefined;
  push_back(_0: EmbindString): void;
  resize(_0: number, _1: EmbindString): void;
  set(_0: number, _1: EmbindString): boolean;
}

export interface LocationList extends ClassHandle {
  size(): number;
  get(_0: number): Location | undefined;
  push_back(_0: Location): void;
  resize(_0: number, _1: Location): void;
  set(_0: number, _1: Location): boolean;
}

export interface TextEditList extends ClassHandle {
  size(): number;
  get(_0: number): TextEdit | undefined;
  push_back(_0: TextEdit): void;
  resize(_0: number, _1: TextEdit): void;
  set(_0: number, _1: TextEdit): boolean;
}

export interface CompletionItemList extends ClassHandle {
  size(): number;
  get(_0: number): CompletionItem | undefined;
  push_back(_0: CompletionItem): void;
  resize(_0: number, _1: CompletionItem): void;
  set(_0: number, _1: CompletionItem): boolean;
}

export interface ParameterInformationList extends ClassHandle {
  size(): number;
  get(_0: number): ParameterInformation | undefined;
  push_back(_0: ParameterInformation): void;
  resize(_0: number, _1: ParameterInformation): void;
  set(_0: number, _1: ParameterInformation): boolean;
}

export interface SignatureInformationList extends ClassHandle {
  size(): number;
  get(_0: number): SignatureInformation | undefined;
  push_back(_0: SignatureInformation): void;
  resize(_0: number, _1: SignatureInformation): void;
  set(_0: number, _1: SignatureInformation): boolean;
}

export interface DocumentSymbolList extends ClassHandle {
  size(): number;
  get(_0: number): DocumentSymbol | undefined;
  push_back(_0: DocumentSymbol): void;
  resize(_0: number, _1: DocumentSymbol): void;
  set(_0: number, _1: DocumentSymbol): boolean;
}

export interface DiagnosticsList extends ClassHandle {
  size(): number;
  get(_0: number): Diagnostics | undefined;
  push_back(_0: Diagnostics): void;
  resize(_0: number, _1: Diagnostics): void;
  set(_0: number, _1: Diagnostics): boolean;
}

export interface Uint32List extends ClassHandle {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
}

export interface LanguageServer extends ClassHandle {
  completionResolve(_0: CompletionItem): CompletionItem | undefined;
  didOpenTextDocument(_0: EmbindString, _1: EmbindString): void;
  didCloseTextDocument(_0: EmbindString): void;
  didChangeTextDocument(_0: EmbindString, _1: TextEditList): void;
  hover(_0: EmbindString, _1: Position): Hover | undefined;
  gotoDefinition(_0: EmbindString, _1: Position): LocationList | undefined;
  completion(_0: EmbindString, _1: Position, _2: CompletionContext): CompletionItemList | undefined;
  semanticTokens(_0: EmbindString): Uint32List | undefined;
  signatureHelp(_0: EmbindString, _1: Position): SignatureHelp | undefined;
  documentSymbol(_0: EmbindString): DocumentSymbolList | undefined;
  getDiagnostics(_0: EmbindString): DiagnosticsList | undefined;
}

export type Position = {
  line: number,
  character: number
};

export type Range = {
  start: Position,
  end: Position
};

export type array_uint_2 = [ number, number ];

export type SignatureHelp = {
  signatures: SignatureInformationList,
  activeSignature: number,
  activeParameter: number
};

export type Error = {
  type: EmbindString,
  result: number,
  message: EmbindString
};

export type Location = {
  uri: EmbindString,
  range: Range
};

export type TextEdit = {
  range: Range,
  text: EmbindString
};

export type MarkupContent = {
  kind: EmbindString,
  value: EmbindString
};

export type Hover = {
  contents: MarkupContent,
  range: Range
};

export type ParameterInformation = {
  label: array_uint_2,
  documentation: MarkupContent
};

export type CompletionItem = {
  label: EmbindString,
  kind: number,
  detail: EmbindString,
  documentation: MarkupContent | undefined,
  textEdit: TextEdit | undefined,
  data: EmbindString,
  commitCharacters: StringList | undefined
};

export type CompletionContext = {
  triggerKind: number,
  triggerCharacter: EmbindString
};

export type SignatureInformation = {
  label: EmbindString,
  documentation: MarkupContent,
  parameters: ParameterInformationList
};

export type DocumentSymbol = {
  name: EmbindString,
  detail: EmbindString,
  kind: number,
  range: Range,
  selectionRange: Range,
  children: DocumentSymbolList
};

export type Diagnostics = {
  code: EmbindString,
  range: Range,
  severity: number,
  message: EmbindString
};

interface EmbindModule {
  GlobalSession: {};
  createGlobalSession(): GlobalSession | null;
  Session: {};
  ComponentType: {};
  TypeLayoutReflection: {};
  ModifierID: {Shared: ModifierIDValue<0>, NoDiff: ModifierIDValue<1>, Static: ModifierIDValue<2>, Const: ModifierIDValue<3>, Export: ModifierIDValue<4>, Extern: ModifierIDValue<5>, Differentiable: ModifierIDValue<6>, Mutating: ModifierIDValue<7>, In: ModifierIDValue<8>, Out: ModifierIDValue<9>, InOut: ModifierIDValue<10>};
  Modifier: {};
  VariableReflection: {};
  VariableLayoutReflection: {};
  GenericReflection: {};
  SlangDeclKind: {SLANG_DECL_KIND_UNSUPPORTED_FOR_REFLECTION: SlangDeclKindValue<0>, SLANG_DECL_KIND_STRUCT: SlangDeclKindValue<1>, SLANG_DECL_KIND_FUNC: SlangDeclKindValue<2>, SLANG_DECL_KIND_MODULE: SlangDeclKindValue<3>, SLANG_DECL_KIND_GENERIC: SlangDeclKindValue<4>, SLANG_DECL_KIND_VARIABLE: SlangDeclKindValue<5>, SLANG_DECL_KIND_NAMESPACE: SlangDeclKindValue<6>};
  DeclReflection: {};
  DeclReflectionKind: {Unsupported: DeclReflectionKindValue<0>, Struct: DeclReflectionKindValue<1>, Func: DeclReflectionKindValue<2>, Module: DeclReflectionKindValue<3>, Generic: DeclReflectionKindValue<4>, Variable: DeclReflectionKindValue<5>, Namespace: DeclReflectionKindValue<6>};
  ScalarType: {None: ScalarTypeValue<0>, Void: ScalarTypeValue<1>, Bool: ScalarTypeValue<2>, Int32: ScalarTypeValue<3>, UInt32: ScalarTypeValue<4>, Int64: ScalarTypeValue<5>, UInt64: ScalarTypeValue<6>, Float16: ScalarTypeValue<7>, Float32: ScalarTypeValue<8>, Float64: ScalarTypeValue<9>, Int8: ScalarTypeValue<10>, UInt8: ScalarTypeValue<11>, Int16: ScalarTypeValue<12>, UInt16: ScalarTypeValue<13>};
  TypeReflection: {};
  TypeReflectionKind: {None: TypeReflectionKindValue<0>, Struct: TypeReflectionKindValue<1>, Array: TypeReflectionKindValue<2>, Matrix: TypeReflectionKindValue<3>, Vector: TypeReflectionKindValue<4>, Scalar: TypeReflectionKindValue<5>, ConstantBuffer: TypeReflectionKindValue<6>, Resource: TypeReflectionKindValue<7>, SamplerState: TypeReflectionKindValue<8>, TextureBuffer: TypeReflectionKindValue<9>, ShaderStorageBuffer: TypeReflectionKindValue<10>, ParameterBlock: TypeReflectionKindValue<11>, GenericTypeParameter: TypeReflectionKindValue<12>, Interface: TypeReflectionKindValue<13>, OutputStream: TypeReflectionKindValue<14>, Specialized: TypeReflectionKindValue<16>, Feedback: TypeReflectionKindValue<17>, Pointer: TypeReflectionKindValue<18>, DynamicResource: TypeReflectionKindValue<19>};
  UserAttribute: {};
  FunctionReflection: {};
  EntryPointReflection: {};
  ThreadGroupSize: {};
  ProgramLayout: {};
  BindingType: {Unknown: BindingTypeValue<0>, Texture: BindingTypeValue<2>, ConstantBuffer: BindingTypeValue<3>, MutableRawBuffer: BindingTypeValue<262>, MutableTypedBuffer: BindingTypeValue<261>, MutableTexture: BindingTypeValue<258>};
  Module: {};
  EntryPoint: {};
  StringList: {
    new(): StringList;
  };
  LocationList: {
    new(): LocationList;
  };
  TextEditList: {
    new(): TextEditList;
  };
  CompletionItemList: {
    new(): CompletionItemList;
  };
  ParameterInformationList: {
    new(): ParameterInformationList;
  };
  SignatureInformationList: {
    new(): SignatureInformationList;
  };
  DocumentSymbolList: {
    new(): DocumentSymbolList;
  };
  DiagnosticsList: {
    new(): DiagnosticsList;
  };
  Uint32List: {
    new(): Uint32List;
  };
  LanguageServer: {};
  createLanguageServer(): LanguageServer | null;
  SLANG_OK: number;
  getLastError(): Error;
  getCompileTargets(): any;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
