export interface Foto {
	alt: string;
	type: 'path' | 'url' | string;
	value: string;
}

export interface Meta {
	leeftijd?: number;
	tags?: string[];
}

export interface BeschrijvingItem {
	kop?: string;
	tekst: string;
}

export interface Persona {
	naam: string;
	foto?: Foto;
	meta?: Meta;
	beschrijving?: BeschrijvingItem[];
}
