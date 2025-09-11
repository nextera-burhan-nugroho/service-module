import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, Logger, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
    FlightSearch,
    HegBookingRequest,
    HegBookingResponse,
    HegFlightSearchResponse,
    HegPaymentRequest,
    HegPaymentResponse,
    HegQueryOrderRequest,
    HegQueryOrderResponse,
    HegSsrRequest,
    HegSsrResponse,
    HegVerifyPriceRequest,
    HegVerifyPriceResponse,
    SsrCode
} from './heg.interface';
import { EnumHegBaggageType, EnumHegCabinClass, EnumHegChangesType, EnumHegGender, EnumHegOrderStatus, EnumHegPassengerType, EnumHegRuleStatus, EnumHegSsrApplyType, EnumHegSsrType, EnumHegTripType, EnumSsrCode, HEG_STATUS_MAP, HegStatusCode } from './heg.enum';
import { SsrCodeDescriptions } from './heg.util';

@Injectable()
export class HegService {
    private readonly logger = new Logger(HegService.name);
    private readonly baseURL: string;
    private readonly account: string;
    private readonly accessSecretKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        // Load configuration from .env or ConfigService
        this.baseURL = this.configService.get<string>('HEG_BASE_URL') ?? (() => { throw new Error('HEG Base URL not configured!'); })();
        this.account = this.configService.get<string>('HEG_ACCOUNT') ?? (() => { throw new Error('HEG account not configured!'); })();
        this.accessSecretKey = this.configService.get<string>('HEG_SECRET_KEY') ?? (() => { throw new Error('HEG secret key not configured!'); })();
    }

    /**
     * Searches SSR codes (Special Service Requests) by code or description.
     * If no query is provided, all SSR codes are returned.
     * 
     * @param query - (Optional) String to search in SSR code or description
     * @returns Array of objects with `code` and `description`
     */
    searchSsrCodes(query?: string): SsrCode[] {
        const lowerQuery = query?.toLowerCase() || '';

        return Object.values(EnumSsrCode)
            .map(code => ({
                code,
                description: SsrCodeDescriptions[code],
            }))
            .filter(
                item =>
                    !lowerQuery ||
                    item.code.toLowerCase().includes(lowerQuery) ||
                    item.description.toLowerCase().includes(lowerQuery),
            );
    }

    /** 
     * Search for available flights.
     * @param body Flight search payload
     */
    async searchFlight(body: FlightSearch): Promise<HegFlightSearchResponse> {
        return await this.sendHegRequest('/api/flight/searchFlight.do', body);
    }

    /**
     * Dummy Verify flight price before booking.
     * @param body Price verification payload
     */
    async verifyPriceDummy(body: HegVerifyPriceRequest): Promise<HegVerifyPriceResponse> {
        const result: HegVerifyPriceResponse = {
            status: '200',
            msg: 'OK',
            sessionId: '6266D4DD72157CE17DAEF02A0C3C07B8',
            routing: body.routing,
        }

        return result
    }

    /**
     * Verify flight price before booking.
     * @param body Price verification payload
     */
    async verifyPrice(body: HegVerifyPriceRequest): Promise<HegVerifyPriceResponse> {
        return await this.sendHegRequest('/api/verify/verifyPrice.do', body);
    }

    /**
     * Dummy Create a new booking order.
     * @param body Booking request payload
     */
    async dummyBooking(body: HegBookingRequest, verified: HegVerifyPriceResponse): Promise<HegBookingResponse> {
        const result: HegBookingResponse = {
            contact: body.contact,
            msg: "OK",
            status: "200",
            orderId: "8934THNG98SDRTGKJ48ASD874FJHIJW3R",
            passengers: body.passengers,
            routing: verified.routing,
            sessionId: "72AEB7600021641151B4396965082C17",
            passengerAuxiliaries: body.passengerAuxiliaries
        }
        return result
    }

    /**
     * Create a new booking order.
     * @param body Booking request payload
     */
    async booking(body: HegBookingRequest): Promise<HegBookingResponse> {
        return await this.sendHegRequest('/api/order/saveOrder.do', body);
    }

    /**
     * Dummy Pay function for an existing order.
     * @param body Payment request payload
     */
    async dummyPay(body: HegPaymentRequest): Promise<HegPaymentResponse> {
        return {
            msg: "OK",
            sessionId: "78234HVN387DLKSDFOISDF9823RNDFGKL2",
            status: "200"
        }
    }

    /**
     * Pay for an existing order.
     * @param body Payment request payload
     */
    async pay(body: HegPaymentRequest): Promise<HegPaymentResponse> {
        return await this.sendHegRequest('/api/order/pay.do', body);
    }

    /**
     * Query an order by its order ID.
     * @param body Query order payload
     */
    async dummyQueryOrder(body: HegQueryOrderRequest): Promise<HegQueryOrderResponse> {
        const dummyHegOrderDetails: HegQueryOrderResponse = {
            msg: "OK",
            status: "200",
            orderDetails:
            {
                status: EnumHegOrderStatus.PAID_NO_TICKETS,
                orderId: 'ORD20250925ABC',
                segments: [
                    {
                        tripType: EnumHegTripType.ONE_WAY,
                        segmentNo: 1,
                        flightNo: 'QZ260',
                        airlineName: 'QZ',
                        airlineLogo: 'https://img.happyeasygo.com/w/static/images/air-logo/36/QZ.png',
                        aircraft: 'Boeing 737',
                        depCity: 'Jakarta',
                        depAirport: 'CGK',
                        depTerminal: 'Terminal 2',
                        depTime: '2025-09-25T16:10:00',
                        arrCity: 'Singapore',
                        arrAirport: 'SIN',
                        arrTerminal: 'Terminal 3',
                        arrTime: '2025-09-25T19:00:00',
                        duration: 170,
                        cabinClass: EnumHegCabinClass.ECONOMY,
                        cabin: 'Y',
                        fareBasis: 'Y123'
                    },
                    {
                        tripType: EnumHegTripType.ROUND_TRIP,
                        segmentNo: 2,
                        flightNo: 'QZ267',
                        airlineName: 'QZ',
                        airlineLogo: 'https://img.happyeasygo.com/w/static/images/air-logo/36/QZ.png',
                        depCity: 'Singapore',
                        depAirport: 'SIN',
                        depTerminal: 'Terminal 3',
                        depTime: '2025-09-30T12:00:00',
                        arrCity: 'Jakarta',
                        arrAirport: 'CGK',
                        arrTerminal: 'Terminal 2',
                        arrTime: '2025-09-30T12:50:00',
                        duration: 50,
                        cabinClass: EnumHegCabinClass.ECONOMY,
                        cabin: 'Y',
                        fareBasis: 'Y123'
                    }
                ],
                ticketDetails: [
                    { itineraryNo: 1, segmentNo: 1, passengerNo: 1, ticketNo: 'TCKT001', pnrCode: 'PNR123' },
                    { itineraryNo: 1, segmentNo: 1, passengerNo: 2, ticketNo: 'TCKT002', pnrCode: 'PNR123' },
                    { itineraryNo: 1, segmentNo: 1, passengerNo: 3, ticketNo: 'TCKT003', pnrCode: 'PNR123' },
                    { itineraryNo: 2, segmentNo: 2, passengerNo: 1, ticketNo: 'TCKT004', pnrCode: 'PNR123' },
                    { itineraryNo: 2, segmentNo: 2, passengerNo: 2, ticketNo: 'TCKT005', pnrCode: 'PNR123' },
                    { itineraryNo: 2, segmentNo: 2, passengerNo: 3, ticketNo: 'TCKT006', pnrCode: 'PNR123' },
                ],
                passengers: [
                    {
                        passengerType: EnumHegPassengerType.ADULT,
                        gender: EnumHegGender.MALE,
                        firstName: "Andi",
                        lastName: "Saputra",
                        dateOfBirth: "1992-08-15",
                        passportNo: "B12345678",
                        dateOfExpiry: "2032-08-15",
                        nationality: "ID",
                        cardIssuePlace: "Jakarta",
                        email: "andi.saputra@example.com",
                        mobile: "+628111234567"
                    },
                    {
                        passengerType: EnumHegPassengerType.ADULT,
                        gender: EnumHegGender.MALE,
                        firstName: "wahtu",
                        lastName: "Saputra",
                        dateOfBirth: "1992-08-15",
                        passportNo: "B12345678",
                        dateOfExpiry: "2032-08-15",
                        nationality: "ID",
                        cardIssuePlace: "Jakarta",
                        email: "andi.saputra@example.com",
                        mobile: "+628111234567"
                    },
                    {
                        passengerType: EnumHegPassengerType.CHILD,
                        gender: EnumHegGender.FEMALE,
                        firstName: "Sari",
                        lastName: "Saputra",
                        dateOfBirth: "1993-05-20",
                        passportNo: "C98765432",
                        dateOfExpiry: "2033-05-20",
                        nationality: "ID",
                        cardIssuePlace: "Jakarta",
                        email: "sari.saputra@example.com",
                        mobile: "+628111234568"
                    }
                ],
                contact: {
                    name: 'Andi Saputra',
                    email: 'andi.saputra@example.com',
                    mobile: '+628111234567'
                },
                rule: {
                    baggageRule: [
                        { segmentNo: 1, baggageType: EnumHegBaggageType.CABIN, passengerType: EnumHegPassengerType.ADULT, baggagePiece: 2, baggageWeight: 20 },
                        { segmentNo: 1, baggageType: EnumHegBaggageType.CHECK_IN, passengerType: EnumHegPassengerType.CHILD, baggagePiece: 1, baggageWeight: 15 },
                    ],
                    changesRule: [
                        {
                            passengerType: EnumHegPassengerType.ADULT,
                            changesType: EnumHegChangesType.PARTIAL_USED,
                            changesStatus: EnumHegRuleStatus.AIRLINE_RULES,
                            changesFee: 50,
                            currency: 'SGD',
                            revNoShow: EnumHegRuleStatus.AIRLINE_RULES,
                            revNoShowCondition: 0,
                            revNoShowFee: 0,
                            changesRemark: 'Changes allowed with fee',
                            useCondition: 1
                        }
                    ],
                    refundRule: [
                        {
                            passengerType: EnumHegPassengerType.ADULT,
                            refundType: 1,
                            refundStatus: EnumHegRuleStatus.AIRLINE_RULES,
                            currency: 'SGD',
                            revNoShow: EnumHegRuleStatus.AIRLINE_RULES,
                            revNoShowCondition: 0,
                            revNoShowFee: 0,
                            useCondition: 1
                        }
                    ]
                },
                prices: [
                    { totalPrices: 448.71, currency: 'SGD' }
                ]
            }
        };


        return dummyHegOrderDetails
    }

    /**
     * Query an order by its order ID.
     * @param body Query order payload
     */
    async queryOrder(body: HegQueryOrderRequest): Promise<HegQueryOrderResponse> {
        return await this.sendHegRequest('/api/order/queryOrderByOrderId.do', body);
    }

    /**
     * Get SSR Dummy (Special Service Request) details.
     * @param body SSR request payload
     */
    async getSsrDummy(body: HegSsrRequest): Promise<HegSsrResponse> {
        const dummySsrResponse: HegSsrResponse = {
            sessionId: 'ABC123456',
            status: '200',
            msg: 'OK',
            baggageSsrsList: [
                {
                    flightNo: 'AI101',
                    baggageSsrs: [
                        {
                            ssrCode: 'BAG20',
                            applyType: EnumHegSsrApplyType.PRE_SALE, // Pre-sale
                            name: '20KG Check-in Baggage',
                            code: 'B20',
                            type: EnumHegSsrType.BAGGAGE, // baggage
                            weight: 20,
                            piece: 1,
                            unit: 'kg',
                            amount: '30.00',
                            currency: 'USD',
                        },
                        {
                            ssrCode: 'BAG30',
                            applyType: EnumHegSsrApplyType.PRE_SALE,
                            name: '30KG Check-in Baggage',
                            code: 'B30',
                            type: EnumHegSsrType.BAGGAGE,
                            weight: 30,
                            piece: 1,
                            unit: 'kg',
                            amount: '40.00',
                            currency: 'USD',
                        },
                    ],
                },
            ],
            seatSsrsList: [
                {
                    flightNo: 'AI101',
                    seatSsrs: [
                        {
                            ssrCode: 'SEAT12A',
                            applyType: EnumHegSsrApplyType.PRE_SALE,
                            name: 'Window Seat 12A',
                            type: EnumHegSsrType.SEAT,
                            code: 'S12A',
                            rowNo: '12',
                            colNo: 'A',
                            deck: '1',
                            amount: '15.00',
                            currency: 'USD',
                            status: 1,
                            nearAisle: 2,
                            nearExit: 2,
                            nearLavatory: 2,
                            nearWindow: 1,
                            overWing: 2,
                            allowChildSelected: 1,
                            withInfant: 2,
                        },
                        {
                            ssrCode: 'SEAT12B',
                            applyType: EnumHegSsrApplyType.PRE_SALE,
                            name: 'Middle Seat 12B',
                            type: EnumHegSsrType.SEAT,
                            code: 'S12B',
                            rowNo: '12',
                            colNo: 'B',
                            deck: '1',
                            amount: '10.00',
                            currency: 'USD',
                            status: 1,
                            nearAisle: 2,
                            nearExit: 2,
                            nearLavatory: 2,
                            nearWindow: 2,
                            overWing: 2,
                            allowChildSelected: 1,
                            withInfant: 2,
                        },
                    ],
                },
            ],
        };
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 200));
        return dummySsrResponse
    }

    /**
     * Get SSR (Special Service Request) details.
     * @param body SSR request payload
     */
    async getSsr(body: HegSsrRequest): Promise<HegSsrResponse> {
        return await this.sendHegRequest('/api/ssr/getSsr.do', body);
    }

    /**
     * Generic method to send HTTP POST request to HEG API with authentication and error handling.
     * @param pathUrl API endpoint path
     * @param body Request payload
     */
    private async sendHegRequest(pathUrl: string, body: Record<string, any>) {
        const requestBody = JSON.stringify(body);
        const token = this.generateToken(body);
        this.logger.log(`HEG API request for ${pathUrl}`)


        try {
            const response = await this.httpService.axiosRef.post(
                `${this.baseURL}${pathUrl}`,
                body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody).toString(),
                        'X-HEG-User': this.account,
                        'X-HEG-Token': token,
                    },
                    timeout: 30000, // 30s timeout
                }
            );

            const hegStatus = Number(response.data?.status);

            if (hegStatus !== HegStatusCode.SUCCESS) {
                const statusInfo = HEG_STATUS_MAP[hegStatus];
                const errorMessage = response.data?.msg || statusInfo?.message || `Unknown HEG error (status: ${hegStatus})`;

                this.logger.error(`HEG API error for ${pathUrl}`, {
                    hegStatus,
                    hegMessage: errorMessage,
                    responseMsg: response.data?.msg,
                    requestBody: body
                });

                if (statusInfo) throw new HttpException(errorMessage, statusInfo.httpStatus);
                else throw new InternalServerErrorException(errorMessage);
            }

            return response.data;
        } catch (error) {
            this.handleRequestError(error, pathUrl, body);
        }
    }

    /**
     * Generate X-HEG-Token based on request body and secret key.
     * Formula: HEX(SHA256(JSON + ":" + accessSecretKey))
     * @param body Request payload
     */
    private generateToken(body: Record<string, any>): string {
        const rawString = JSON.stringify(body) + ':' + this.accessSecretKey;
        return crypto.createHash('sha256').update(rawString).digest('hex');
    }

    /**
     * Handle HTTP errors with proper logging and exception mapping
     * @param error Error object from axios
     * @param pathUrl API endpoint path
     * @param body Request payload
     */
    private handleRequestError(error: any, pathUrl: string, body: Record<string, any>) {
        if (error instanceof HttpException) throw error;

        this.logger.error(`HTTP request failed for ${pathUrl}`, {
            pathUrl,
            requestBody: body,
            httpStatus: error.response?.status,
            responseData: error.response?.data,
            errorCode: error.code,
            errorMessage: error.message
        });

        if (error.response?.status) {
            switch (error.response.status) {
                case HttpStatus.UNAUTHORIZED: throw new HttpException('HEG API authentication failed', HttpStatus.UNAUTHORIZED);
                case HttpStatus.FORBIDDEN: throw new HttpException('Access forbidden to HEG API', HttpStatus.FORBIDDEN);
                case HttpStatus.NOT_FOUND: throw new HttpException('HEG API endpoint not found', HttpStatus.NOT_FOUND);
                case HttpStatus.TOO_MANY_REQUESTS: throw new HttpException('HEG API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
                case HttpStatus.INTERNAL_SERVER_ERROR: throw new HttpException('HEG API server error', HttpStatus.BAD_GATEWAY);
                default: throw new HttpException(error.response.data?.message || 'HEG API request failed', error.response.status);
            }
        }

        if (['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)) throw new HttpException('HEG API request timeout', HttpStatus.REQUEST_TIMEOUT);
        if (['ECONNREFUSED', 'ENOTFOUND'].includes(error.code)) throw new HttpException('Unable to connect to HEG API', HttpStatus.SERVICE_UNAVAILABLE);

        throw new InternalServerErrorException('Unexpected error calling HEG API');
    }
}
