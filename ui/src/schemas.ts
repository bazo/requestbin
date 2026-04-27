import { z } from "zod";

export const UrlSchema = z.object({
	Scheme: z.string(),
	Opaque: z.string(),
	User: z.null(),
	Host: z.string(),
	Path: z.string(),
	RawPath: z.string(),
	OmitHost: z.boolean(),
	ForceQuery: z.boolean(),
	RawQuery: z.string(),
	Fragment: z.string(),
	RawFragment: z.string(),
});

export const FormSchema = z.record(z.string(), z.string());

export const HeaderSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));

export const RequestSchema = z.object({
	ID: z.string(),
	Method: z.string(),
	URL: UrlSchema,
	Proto: z.string(),
	ProtoMajor: z.number(),
	ProtoMinor: z.number(),
	Header: HeaderSchema,
	ContentType: z.string(),
	Body: z.string(),
	ContentLength: z.number(),
	TransferEncoding: z.string().nullable(),
	Host: z.string(),
	Form: FormSchema,
	PostForm: FormSchema,
	MultipartForm: z.unknown(),
	Trailer: z.unknown(),
	RemoteAddr: z.string(),
	RequestURI: z.string(),
	TLS: z.unknown(),
	Time: z.string(),
});

export const BinSchema = z.object({
	ID: z.string(),
});

export const BinResponseSchema = z.array(BinSchema);

export const RequestsResponseSchema = z.object({
	binID: z.string(),
	page: z.number(),
	pagesCount: z.number(),
	requests: z.array(RequestSchema),
});

export type URL = z.infer<typeof UrlSchema>;
export type Form = z.infer<typeof FormSchema>;
export type Header = z.infer<typeof HeaderSchema>;
export type Request = z.infer<typeof RequestSchema>;
export type Bin = z.infer<typeof BinSchema>;
export type BinResponse = z.infer<typeof BinResponseSchema>;
export type RequestsResponse = z.infer<typeof RequestsResponseSchema>;
