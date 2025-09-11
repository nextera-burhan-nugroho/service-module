/**
 * ===============================
 * HEG Base Types & Responses
 * ===============================
 */

import { EnumHegBaggageType, EnumHegCabinClass, EnumHegChangesType, EnumHegGender, EnumHegOrderStatus, EnumHegPassengerType, EnumHegRuleStatus, EnumHegSsrApplyType, EnumHegSsrType, EnumHegTripType, EnumSsrCode } from "./heg.enum";

export interface HegBaseResponse {
    status: string; // "200" / error code
    msg: string;    // success / error message
}

/**
 * ===============================
 * Flight Search
 * ===============================
 */

export interface FlightSearch {
    tripType: EnumHegTripType;
    fromDate: string;
    retDate?: string;
    cabinClass: string;
    adultNum: number;
    childNum?: number;
    infantNum?: number;
    fromCity: string;
    toCity: string;
}

export interface HegFlightSearchResponse extends HegBaseResponse {
    routings: HegRouting[];
}

export interface HegRouting {
    data: string;
    fromSegments: HegSegment[];
    retSegments?: HegSegment[];
    priceInfo: HegPriceInfo;
    ticketPriceInfo: HegTicketPriceInfo;
    rule: HegRule;
}

export interface HegSegment {
    tripType: EnumHegTripType;
    segmentNo: number;
    flightNo: string;
    airlineName: string;
    airlineLogo: string;
    aircraft?: string;
    depCity: string;
    depAirport: string;
    depTerminal?: string;
    depTime: string;
    arrCity: string;
    arrAirport: string;
    arrTerminal?: string;
    arrTime: string;
    duration: number;
    cabinClass: EnumHegCabinClass;
    cabin: string;
    fareBasis?: string;
}

export interface HegPriceInfo {
    adultPrice: number;
    adultTaxes: number;
    childPrice: number;
    childTaxes: number;
    convenienceFee: number;
    totalPrices: number;
    currency: string;
}

export interface HegTicketPriceInfo extends HegPriceInfo { }

/**
 * ===============================
 * Rules
 * ===============================
 */

export interface HegRule {
    baggageRule?: HegBaggageRule[];
    changesRule?: HegChangesRule[];
    refundRule?: HegRefundRule[];
}

export interface HegBaggageRule {
    segmentNo: number;
    baggageType: EnumHegBaggageType;
    passengerType: EnumHegPassengerType;
    baggagePiece: number;
    baggageWeight: number;
}

export interface HegChangesRule {
    passengerType: EnumHegPassengerType;
    changesType?: EnumHegChangesType;
    changesStatus?: EnumHegRuleStatus;
    changesFee?: number;
    currency: string;
    revNoShow?: EnumHegRuleStatus;
    revNoShowCondition?: number;
    revNoShowFee?: number;
    changesRemark?: string;
    useCondition?: number;
    conditionList?: HegCondition[];
}

export interface HegRefundRule {
    passengerType: EnumHegPassengerType;
    refundType: number;
    refundStatus: EnumHegRuleStatus;
    refundFee?: number;
    currency: string;
    revNoShow?: EnumHegRuleStatus;
    revNoShowCondition?: number;
    revNoShowFee?: number;
    useCondition?: number;
    conditionList?: HegCondition[];
}

export interface HegCondition {
    status: EnumHegRuleStatus;
    endMinute: number;
    amount?: number;
}

/**
 * ===============================
 * Verify Price
 * ===============================
 */

export interface HegVerifyPriceRequest {
    data: string;
    tripType: EnumHegTripType;
    routing: HegRouting;
    adultNum: number;
    childNum: number;
    infantNum: number;
}

export interface HegVerifyPriceResponse extends HegBaseResponse {
    routing: HegRouting;
    sessionId: string;
}

/**
 * ===============================
 * Booking
 * ===============================
 */

export interface HegBookingRequest {
    tripType: EnumHegTripType;
    sessionId: string;
    data: string;
    passengers: HegPassenger[];
    contact: HegContact;
    passengerAuxiliaries?: HegPassengerAuxiliary[];
}

export interface HegBookingResponse extends HegBaseResponse {
    orderId: string;
    routing: HegRouting;
    sessionId: string;
    passengers: HegPassenger[];
    contact: HegContact;
    passengerAuxiliaries?: HegPassengerAuxiliary[];
}

/**
 * ===============================
 * Payment
 * ===============================
 */

export interface HegPaymentRequest {
    orderId: string;
}

export interface HegPaymentResponse extends HegBaseResponse {
    sessionId: string;
}

/**
 * ===============================
 * Query Order
 * ===============================
 */

export interface HegQueryOrderRequest {
    orderId: string;
}

export interface HegQueryOrderResponse extends HegBaseResponse {
    orderDetails: HegOrderDetails;
}

export interface HegOrderDetails {
    orderId: string;
    status: EnumHegOrderStatus;
    segments: HegSegment[];
    ticketDetails: HegTicketDetails[];
    passengers: HegPassenger[];
    contact: HegContact;
    rule: HegRule;
    prices: HegPrice[];
}

export interface HegTicketDetails {
    itineraryNo: number;
    segmentNo: number;
    passengerNo: number;
    ticketNo: string;
    pnrCode: string;
}

export interface HegPrice {
    totalPrices: number;
    currency: string;
}

/**
 * ===============================
 * Ancillary (SSR)
 * ===============================
 */

export interface HegSsrRequest {
    sessionId: string;
    type?: number;
    data?: string;
    orderId?: string;
}

export interface HegSsrResponse extends HegBaseResponse {
    sessionId: string;
    baggageSsrsList?: HegBaggageSsrs[];
    seatSsrsList?: HegSeatSsrs[];
}

export interface HegBaggageSsrs {
    flightNo: string;
    baggageSsrs: HegBaggageSsr[];
}

export interface HegBaggageSsr {
    ssrCode: string;
    applyType: EnumHegSsrApplyType;
    name: string;
    code: string;
    type: EnumHegSsrType;
    weight: number;
    piece: number;
    unit: string;
    amount: string;
    currency: string;
}

export interface HegSeatSsrs {
    flightNo: string;
    seatSsrs: HegSeatSsr[];
}

export interface HegSeatSsr {
    ssrCode: string;
    applyType: EnumHegSsrApplyType;
    name: string;
    type: EnumHegSsrType;
    code: string;
    rowNo: string;
    colNo: string;
    deck: string;
    amount: string;
    currency: string;
    status: number;
    nearAisle: number;
    nearExit: number;
    nearLavatory: number;
    nearWindow: number;
    overWing: number;
    allowChildSelected: number;
    withInfant: number;
}

/**
 * ===============================
 * Passenger & Contact
 * ===============================
 */

export interface HegPassenger {
    passengerNo?: number;
    passengerType: EnumHegPassengerType;
    gender: EnumHegGender;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    passportNo?: string;
    dateOfExpiry?: string;
    nationality?: string;
    cardIssuePlace?: string;
    email?: string;
    mobile?: string;
}

export interface HegContact {
    name: string;
    email?: string;
    mobile: string;
}

export interface HegPassengerAuxiliary {
    segmentNo: number;
    passengerNo: number;
    ssrCodes: HegAuxiliaryCode[];
}

export interface HegAuxiliaryCode {
    ssrCode: EnumSsrCode;
}

export interface SsrCode {
    code: string;
    description: string;
}