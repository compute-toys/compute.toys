// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export interface ClassHandle {
  isAliasOf(other: ClassHandle): boolean;
  delete(): void;
  deleteLater(): this;
  isDeleted(): boolean;
  // @ts-ignore - If targeting lower than ESNext, this symbol might not exist.
  [Symbol.dispose](): void;
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
  link(): any;
  getEntryPointCode(_0: number, _1: number): string;
  getEntryPointCodeBlob(_0: number, _1: number): any;
  getTargetCodeBlob(_0: number): any;
  getTargetCode(_0: number): string;
  loadStrings(): any;
  getLayout(_0: number): ProgramLayout | null;
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
  getName(): string;
  findModifier(_0: ModifierID): Modifier | null;
  getUserAttributeCount(): number;
  hasDefaultValue(): boolean;
  getType(): TypeReflection | null;
  getUserAttributeByIndex(_0: number): UserAttribute | null;
}

export interface VariableLayoutReflection extends ClassHandle {
  getName(): string;
  getTypeLayout(): TypeLayoutReflection | null;
  getBindingIndex(): number;
}

export interface GenericReflection extends ClassHandle {
  getName(): string;
  getTypeParameterCount(): number;
  getValueParameterCount(): number;
  getTypeParameter(_0: number): VariableReflection | null;
  getValueParameter(_0: number): VariableReflection | null;
  getOuterGenericContainer(): GenericReflection | null;
  getInnerKind(): SlangDeclKind;
  asDecl(): DeclReflection | null;
  getInnerDecl(): DeclReflection | null;
}

export interface SlangDeclKindValue<T extends number> {
  value: T;
}
export type SlangDeclKind = SlangDeclKindValue<0>|SlangDeclKindValue<1>|SlangDeclKindValue<2>|SlangDeclKindValue<3>|SlangDeclKindValue<4>|SlangDeclKindValue<5>|SlangDeclKindValue<6>;

export interface DeclReflection extends ClassHandle {
  getName(): string;
  getChildrenCount(): number;
  getChild(_0: number): DeclReflection | null;
  asVariable(): VariableReflection | null;
  asGeneric(): GenericReflection | null;
  getParent(): DeclReflection | null;
  getKind(): DeclReflectionKind;
  getType(): TypeReflection | null;
  asFunction(): FunctionReflection | null;
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
  getName(): string;
  getArgumentCount(): number;
  getArgumentType(_0: number): TypeReflection | null;
  getArgumentValueString(_0: number): string;
  getArgumentValueFloat(_0: number): number;
}

export interface FunctionReflection extends ClassHandle {
  getName(): string;
  getUserAttributeCount(): number;
  getUserAttributeByIndex(_0: number): UserAttribute | null;
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
  toJsonObject(): any;
  getParameterCount(): number;
  getParameterByIndex(_0: number): VariableLayoutReflection | null;
  getGlobalParamsTypeLayout(): TypeLayoutReflection | null;
  findEntryPointByName(_0: EmbindString): EntryPointReflection | null;
  findFunctionByName(_0: EmbindString): FunctionReflection | null;
}

export interface BindingTypeValue<T extends number> {
  value: T;
}
export type BindingType = BindingTypeValue<0>|BindingTypeValue<2>|BindingTypeValue<3>|BindingTypeValue<262>|BindingTypeValue<261>|BindingTypeValue<258>;

export interface Module extends ComponentType {
  findEntryPointByName(_0: EmbindString): any;
  findAndCheckEntryPoint(_0: EmbindString, _1: number): any;
  getDefinedEntryPoint(_0: number): any;
  getDefinedEntryPointCount(): number;
}

export type Error = {
  type: EmbindString,
  result: number,
  message: EmbindString
};

export interface EntryPoint extends ComponentType {
  getName(): string;
}

export interface StringList extends ClassHandle {
  push_back(_0: EmbindString): void;
  resize(_0: number, _1: EmbindString): void;
  size(): number;
  get(_0: number): EmbindString | undefined;
  set(_0: number, _1: EmbindString): boolean;
}

export type Position = {
  line: number,
  character: number
};

export type Range = {
  start: Position,
  end: Position
};

export type Location = {
  uri: EmbindString,
  range: Range
};

export interface LocationList extends ClassHandle {
  push_back(_0: Location): void;
  resize(_0: number, _1: Location): void;
  size(): number;
  get(_0: number): Location | undefined;
  set(_0: number, _1: Location): boolean;
}

export type TextEdit = {
  range: Range,
  text: EmbindString
};

export interface TextEditList extends ClassHandle {
  push_back(_0: TextEdit): void;
  resize(_0: number, _1: TextEdit): void;
  size(): number;
  get(_0: number): TextEdit | undefined;
  set(_0: number, _1: TextEdit): boolean;
}

export type MarkupContent = {
  kind: EmbindString,
  value: EmbindString
};

export type Hover = {
  contents: MarkupContent,
  range: Range
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

export interface CompletionItemList extends ClassHandle {
  push_back(_0: CompletionItem): void;
  resize(_0: number, _1: CompletionItem): void;
  size(): number;
  get(_0: number): CompletionItem | undefined;
  set(_0: number, _1: CompletionItem): boolean;
}

export type CompletionContext = {
  triggerKind: number,
  triggerCharacter: EmbindString
};

export type array_uint_2 = [ number, number ];

export type ParameterInformation = {
  label: array_uint_2,
  documentation: MarkupContent
};

export interface ParameterInformationList extends ClassHandle {
  push_back(_0: ParameterInformation): void;
  resize(_0: number, _1: ParameterInformation): void;
  size(): number;
  get(_0: number): ParameterInformation | undefined;
  set(_0: number, _1: ParameterInformation): boolean;
}

export type SignatureInformation = {
  label: EmbindString,
  documentation: MarkupContent,
  parameters: ParameterInformationList
};

export interface SignatureInformationList extends ClassHandle {
  push_back(_0: SignatureInformation): void;
  resize(_0: number, _1: SignatureInformation): void;
  size(): number;
  get(_0: number): SignatureInformation | undefined;
  set(_0: number, _1: SignatureInformation): boolean;
}

export type SignatureHelp = {
  signatures: SignatureInformationList,
  activeSignature: number,
  activeParameter: number
};

export interface DocumentSymbolList extends ClassHandle {
  push_back(_0: DocumentSymbol): void;
  resize(_0: number, _1: DocumentSymbol): void;
  size(): number;
  get(_0: number): DocumentSymbol | undefined;
  set(_0: number, _1: DocumentSymbol): boolean;
}

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

export interface DiagnosticsList extends ClassHandle {
  push_back(_0: Diagnostics): void;
  resize(_0: number, _1: Diagnostics): void;
  size(): number;
  get(_0: number): Diagnostics | undefined;
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
  didOpenTextDocument(_0: EmbindString, _1: EmbindString): void;
  didCloseTextDocument(_0: EmbindString): void;
  didChangeTextDocument(_0: EmbindString, _1: TextEditList): void;
  hover(_0: EmbindString, _1: Position): Hover | undefined;
  gotoDefinition(_0: EmbindString, _1: Position): LocationList | undefined;
  completion(_0: EmbindString, _1: Position, _2: CompletionContext): CompletionItemList | undefined;
  completionResolve(_0: CompletionItem): CompletionItem | undefined;
  semanticTokens(_0: EmbindString): Uint32List | undefined;
  signatureHelp(_0: EmbindString, _1: Position): SignatureHelp | undefined;
  documentSymbol(_0: EmbindString): DocumentSymbolList | undefined;
  getDiagnostics(_0: EmbindString): DiagnosticsList | undefined;
}

interface EmbindModule {
  SLANG_OK: number;
  getCompileTargets(): any;
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
  getLastError(): Error;
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
}

export type MainModule = WasmModule & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
