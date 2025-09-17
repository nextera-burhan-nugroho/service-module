import { TextOptionsLight } from 'jspdf';
import { UserOptions } from 'jspdf-autotable';

export interface index {
    Index: string;
    Page: number;
}

export interface TableOptions extends UserOptions {
    ignoreFields?: string[];
    tableName: string;
    addToIndex?: boolean;
}

export interface TextOptions extends TextOptionsLight {
    x?: number;
    y?: number;
    addToIndex?: boolean;
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    fontName?: string;
}

export interface ColumnLayoutOptions {
    columns?: number;
    margin?: number;
    gap?: number;
    lineHeight?: number;
}