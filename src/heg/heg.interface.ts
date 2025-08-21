/**
 * ===============================
 * HEG Base Types & Responses
 * ===============================
 */

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
    tripType: string;
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
    segmentNo: number;
    flightNo: string;
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
    cabinClass: HegCabinClass;
    cabin: string;
    fareBasis: string;
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
    baggageRules: HegBaggageRule[];
    changesRules: HegChangesRule[];
    refundRules: HegRefundRule[];
}

export interface HegBaggageRule {
    segmentNo: number;
    baggageType: HegBaggageType;
    passengerType: HegPassengerType;
    baggagePiece: number;
    baggageWeight: number;
}

export interface HegChangesRule {
    passengerType: HegPassengerType;
    changesType: number;
    changesStatus: HegRuleStatus;
    changesFee?: number;
    currency: string;
    revNoShow: HegRuleStatus;
    revNoShowCondition: number;
    revNoShowFee: number;
    changesRemark: string;
    useCondition: number;
    conditionList?: HegCondition[];
}

export interface HegRefundRule {
    passengerType: HegPassengerType;
    refundType: number;
    refundStatus: HegRuleStatus;
    refundFee?: number;
    currency: string;
    revNoShow: HegRuleStatus;
    revNoShowCondition: number;
    revNoShowFee: number;
    useCondition: number;
    conditionList?: HegCondition[];
}

export interface HegCondition {
    status: HegRuleStatus;
    endMinute: number;
    amount?: number;
}

/**
 * ===============================
 * Verify Price
 * ===============================
 */

export interface HegVerifyPriceRequest {
    tripType: HegTripType;
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
    tripType: HegTripType;
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
    status: HegOrderStatus;
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
    applyType: HegSsrApplyType;
    name: string;
    code: string;
    type: HegSsrType;
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
    applyType: HegSsrApplyType;
    name: string;
    type: HegSsrType;
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
    allowChild: number;
    withInfant: number;
}

/**
 * ===============================
 * Passenger & Contact
 * ===============================
 */

export interface HegPassenger {
    passengerNo?: number;
    passengerType: HegPassengerType;
    gender: HegGender;
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
    ssrCode: string;
}

/**
 * ===============================
 * Enums
 * ===============================
 */

export enum HegOrderStatus {
    CREATED_UNPAID = "1",
    PAID_NO_TICKETS = "2",
    PARTIALLY_ISSUED = "3",
    FULLY_ISSUED = "4",
    CANCELLED = "5"
}

export enum HegPassengerType {
    ADULT = "1",
    CHILD = "2",
    INFANT = "3"
}

export enum HegGender {
    MALE = "1",
    FEMALE = "2"
}

export enum HegCabinClass {
    ECONOMY = "Y",
    BUSINESS = "C",
    FIRST = "F"
}

export enum HegTripType {
    ONE_WAY = "1",
    ROUND_TRIP = "2"
}

export enum HegBaggageType {
    CHECK_IN = "1",
    CABIN = "2"
}

export enum HegSsrType {
    BAGGAGE = "0",
    SEAT = "1"
}

export enum HegSsrApplyType {
    PRE_SALE = "1",
    AFTER_SALE = "2"
}

export enum HegRuleStatus {
    UNCHANGEABLE = "T",
    CONDITIONAL = "H",
    FREE = "F",
    AIRLINE_RULES = "E"
}
