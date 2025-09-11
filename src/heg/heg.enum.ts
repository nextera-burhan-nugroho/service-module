import { HttpStatus } from '@nestjs/common';

/**
 * ===============================
 * Enums (Domain)
 * ===============================
 */

export enum EnumHegOrderStatus {
    CREATED_UNPAID = "1",
    PAID_NO_TICKETS = "2",
    PARTIALLY_ISSUED = "3",
    FULLY_ISSUED = "4",
    CANCELLED = "5"
}

export enum EnumHegPassengerType {
    ADULT = 1,
    CHILD = 2,
    INFANT = 3
}

export enum EnumHegGender {
    MALE = "1",
    FEMALE = "2"
}

export enum EnumHegCabinClass {
    ECONOMY = "Y",
    BUSINESS = "C",
    FIRST = "F"
}

export enum EnumHegTripType {
    ONE_WAY = 1,
    ROUND_TRIP = 2
}

export enum EnumHegBaggageType {
    CHECK_IN = 1,
    CABIN = 2
}

export enum EnumHegSsrType {
    BAGGAGE = "0",
    SEAT = "1"
}

export enum EnumHegSsrApplyType {
    PRE_SALE = "1",
    AFTER_SALE = "2"
}

export enum EnumHegRuleStatus {
    UNCHANGEABLE = "T",
    CONDITIONAL = "H",
    FREE = "F",
    AIRLINE_RULES = "E"
}

export enum EnumHegChangesType {
    UNUSED = 0,
    PARTIAL_USED = 1
}

export enum EnumSsrCode {
    // Blind / Vision Impaired
    BDGP = 'BDGP',
    BDGR = 'BDGR',
    BLND = 'BLND',
    BLDP = 'BLDP',
    BLDR = 'BLDR',
    BLSC = 'BLSC',

    // Intellectual / Medical / Assistance
    DMAA = 'DMAA',
    DEAF = 'DEAF',
    ESAN = 'ESAN',
    MAAS = 'MAAS',
    MEDA = 'MEDA',
    SVAN = 'SVAN',
    WCOB = 'WCOB',
    WCHR = 'WCHR',
    WCHS = 'WCHS',
    WCHC = 'WCHC',
    WCMP = 'WCMP',
    WCBD = 'WCBD',
    WCBW = 'WCBW',
    DPNA = 'DPNA', // Disabled Passenger Needing Assistance
    UADT = 'UADT', // Unaccompanied Adult

    // Special Seating
    BSCT = 'BSCT',
    CHD = 'CHD',
    EXST = 'EXST', // Extra Seat
    INF = 'INF',
    INFT = 'INFT', // Infant
    UMNR = 'UMNR',
    PETC = 'PETC',
    SMED = 'SMED',
    NSST = 'NSST', // No Smoking Seat
    NSSB = 'NSSB', // No Smoking Bulkhead Seat
    STCR = 'STCR', // Stretcher
    SPEQ = 'SPEQ', // Special Equipment

    // Special Meal
    AVML = 'AVML',
    BBML = 'BBML',
    BLML = 'BLML',
    CHML = 'CHML',
    DBML = 'DBML',
    FFML = 'FFML',
    FPML = 'FPML', // Fruit Platter
    GFML = 'GFML',
    HFML = 'HFML',
    HNML = 'HNML',
    JAIN = 'JAIN',
    KSML = 'KSML',
    LCML = 'LCML',
    LFML = 'LFML',
    LSML = 'LSML',
    LPML = 'LPML',
    MOML = 'MOML',
    NLML = 'NLML',
    ORML = 'ORML',
    PRML = 'PRML',
    RVML = 'RVML',
    SPML = 'SPML',
    SPMLJAPANESE = 'SPMLJAPANESE',
    VGML = 'VGML',
    VLML = 'VLML',

    // Baggage
    BULK = 'BULK',
    CBBG = 'CBBG',

    // Other
    AVIH = 'AVIH',
    BBSL = 'BBSL',
    LANG = 'LANG', // Language Spoken
    FQTV = 'FQTV',
}


/**
 * ===============================
 * HEG API Status Codes
 * ===============================
 */

export enum HegStatusCode {
    SUCCESS = 200,
    SYSTEM_ERROR = 500,
    BAD_REQUEST = 201,
    PROGRAM_EXCEPTION = 203,
    NO_QUOTATION = 101,
    PRICE_VERIFY_FAILURE = 105,
    DUPLICATE_ORDER = 106,
    EMPTY_DATA = 107,
    NONEXISTENT_DATA = 108,
    AUXILIARY_ORDER_FAILED = 109,
    NO_AUXILIARY_INFO = 111,
    ORDER_NOT_EXIST = 112,
    INCOMPLETE_PASSENGER_INFO = 113,
    EMPTY_ORDER_NUMBER = 114,
    ORDER_CANCELLED = 115,
    ORDER_PAID = 116
}

/**
 * Maps HEG status codes to error messages and HTTP statuses
 */
export const HEG_STATUS_MAP = {
    [HegStatusCode.SUCCESS]: { message: 'Success', httpStatus: HttpStatus.OK },
    [HegStatusCode.SYSTEM_ERROR]: { message: 'System Error', httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
    [HegStatusCode.BAD_REQUEST]: { message: 'Bad Request', httpStatus: HttpStatus.BAD_REQUEST },
    [HegStatusCode.PROGRAM_EXCEPTION]: { message: 'Program exception', httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
    [HegStatusCode.NO_QUOTATION]: { message: 'No quotation for this flight', httpStatus: HttpStatus.NOT_FOUND },
    [HegStatusCode.PRICE_VERIFY_FAILURE]: { message: 'Price verify failure', httpStatus: HttpStatus.BAD_REQUEST },
    [HegStatusCode.DUPLICATE_ORDER]: { message: 'Duplicate order', httpStatus: HttpStatus.CONFLICT },
    [HegStatusCode.EMPTY_DATA]: { message: 'Data cannot be empty', httpStatus: HttpStatus.BAD_REQUEST },
    [HegStatusCode.NONEXISTENT_DATA]: { message: 'Nonexistent data', httpStatus: HttpStatus.NOT_FOUND },
    [HegStatusCode.AUXILIARY_ORDER_FAILED]: { message: 'Auxiliary order failed', httpStatus: HttpStatus.BAD_REQUEST },
    [HegStatusCode.NO_AUXILIARY_INFO]: { message: 'No auxiliary information', httpStatus: HttpStatus.NOT_FOUND },
    [HegStatusCode.ORDER_NOT_EXIST]: { message: 'Order does not exist', httpStatus: HttpStatus.NOT_FOUND },
    [HegStatusCode.INCOMPLETE_PASSENGER_INFO]: { message: 'Incomplete passenger info', httpStatus: HttpStatus.BAD_REQUEST },
    [HegStatusCode.EMPTY_ORDER_NUMBER]: { message: 'Order number cannot be empty', httpStatus: HttpStatus.BAD_REQUEST },
    [HegStatusCode.ORDER_CANCELLED]: { message: 'Order has been cancelled', httpStatus: HttpStatus.GONE },
    [HegStatusCode.ORDER_PAID]: { message: 'Order has been paid', httpStatus: HttpStatus.CONFLICT }
};

