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
    HegVerifyPriceResponse
} from './heg.interface';

/**
 * HEG API Status Codes
 */
enum HegStatusCode {
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
const HEG_STATUS_MAP = {
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
     * Search for available flights.
     * @param body Flight search payload
     */
    async searchFlight(body: FlightSearch): Promise<HegFlightSearchResponse> {
        return await this.sendHegRequest('/api/flight/searchFlight.do', body);
    }

    /**
     * Verify flight price before booking.
     * @param body Price verification payload
     */
    async verifyPrice(body: HegVerifyPriceRequest): Promise<HegVerifyPriceResponse> {
        return await this.sendHegRequest('/api/verify/verifyPrice.do', body);
    }

    /**
     * Create a new booking order.
     * @param body Booking request payload
     */
    async booking(body: HegBookingRequest): Promise<HegBookingResponse> {
        return await this.sendHegRequest('/api/order/saveOrder.do', body);
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
    async queryOrder(body: HegQueryOrderRequest): Promise<HegQueryOrderResponse> {
        return await this.sendHegRequest('/api/order/queryOrderByOrderId.do', body);
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
