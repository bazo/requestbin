export interface Bin {
	ID: string;
}

export interface RequestsResponse {
    binID:      string;
    page:       number;
    pagesCount: number;
    requests:   Request[];
}

export interface Request {
    ID:               string;
    Method:           string;
    URL:              URL;
    Proto:            string;
    ProtoMajor:       number;
    ProtoMinor:       number;
    Header:           Header;
    ContentType:      string;
    Body:             string;
    ContentLength:    number;
    TransferEncoding: null;
    Host:             string;
    Form:             Form;
    PostForm:         Form;
    MultipartForm:    null;
    Trailer:          null;
    RemoteAddr:       string;
    RequestURI:       string;
    TLS:              null;
    Time:             Date;
}

export interface Form {
}

export interface Header {
    Accept:            string[];
    "Accept-Encoding": string[];
    "Cache-Control":   string[];
    Connection:        string[];
    "Content-Length":  string[];
    "Content-Type":    string[];
    "Postman-Token":   string[];
    "User-Agent":      string[];
}

export interface URL {
    Scheme:      string;
    Opaque:      string;
    User:        null;
    Host:        string;
    Path:        string;
    RawPath:     string;
    OmitHost:    boolean;
    ForceQuery:  boolean;
    RawQuery:    string;
    Fragment:    string;
    RawFragment: string;
}
