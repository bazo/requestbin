export interface Bin {
	ID: string;
}

export interface RequestsResponse {
	binID: string;
	page: number;
	pagesCount: number;
	requests: Request[];
}

export interface Request {
	ID: string;
	Method: string;
	URL: URL;
	Proto: string;
	ProtoMajor: number;
	ProtoMinor: number;
	Header: Header;
	ContentType: string;
	Body: string;
	ContentLength: number;
	TransferEncoding: string;
	Host: string;
	Form: Form;
	PostForm: Form;
	MultipartForm: null;
	Trailer: null;
	RemoteAddr: string;
	RequestURI: string;
	TLS: null;
	Time: string;
}

export interface Form {
	[key: string]: string;
}

export interface Header {
	[key: string]: string;
}

export interface URL {
	Scheme: string;
	Opaque: string;
	User: null;
	Host: string;
	Path: string;
	RawPath: string;
	OmitHost: boolean;
	ForceQuery: boolean;
	RawQuery: string;
	Fragment: string;
	RawFragment: string;
}
