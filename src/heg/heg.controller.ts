import { Controller, Get, Query, ParseIntPipe, Post, Body } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { HegService } from './heg.service';
import { VerifyPriceRequestDto } from './dto/verify-heg.dto';
import { HegBookingResponse, HegPaymentResponse, HegQueryOrderResponse, HegSsrResponse, HegVerifyPriceResponse } from './heg.interface';
import { BookingRequestDto } from './dto/booking-heg.dto';
import { PayRequestDto } from './dto/pay.dto';
import { QueryOrderRequestDto } from './dto/query-order.dto';
import { GetSsrRequestDto } from './dto/get-ssr.dto';

@ApiTags('HEG Flight')
@Controller('heg')
export class HegController {
    constructor(private readonly hegService: HegService) { }

    @Get('search')
    @ApiQuery({
        name: 'tripType',
        enum: ['1', '2'],
        description: '1 = One Way, 2 = Round Trip',
        example: '1',
    })
    @ApiQuery({
        name: 'fromDate',
        type: String,
        description: 'Departure date (yyyy-MM-dd)',
        example: '2025-08-25',
    })
    @ApiQuery({
        name: 'retDate',
        type: String,
        required: false,
        description: 'Return date (yyyy-MM-dd, required if tripType=2)',
        example: '2025-08-30',
    })
    @ApiQuery({
        name: 'cabinClass',
        enum: ['Y', 'C', 'F'],
        description: 'Y = Economy, C = Business, F = First Class',
        example: 'Y',
    })
    @ApiQuery({
        name: 'adultNum',
        type: Number,
        description: 'Adult passengers (1–9)',
        example: 1,
    })
    @ApiQuery({
        name: 'childNum',
        type: Number,
        required: false,
        description: 'Child passengers (0–9)',
        example: 0,
    })
    @ApiQuery({
        name: 'infantNum',
        type: Number,
        required: false,
        description: 'Infant passengers (0–9)',
        example: 0,
    })
    @ApiQuery({
        name: 'fromCity',
        type: String,
        description: 'City code of origin',
        example: 'JKT',
    })
    @ApiQuery({
        name: 'toCity',
        type: String,
        description: 'City code of destination',
        example: 'SIN',
    })
    async searchFlight(
        @Query('tripType') tripType: string,
        @Query('fromDate') fromDate: string,
        @Query('retDate') retDate: string,
        @Query('cabinClass') cabinClass: string,
        @Query('adultNum', ParseIntPipe) adultNum: number,
        @Query('childNum', ParseIntPipe) childNum: number,
        @Query('infantNum', ParseIntPipe) infantNum: number,
        @Query('fromCity') fromCity: string,
        @Query('toCity') toCity: string,
    ) {
        return await this.hegService.searchFlight({
            tripType,
            fromDate,
            retDate,
            cabinClass,
            adultNum,
            childNum,
            infantNum,
            fromCity,
            toCity,
        });
    }

    @Post('verifyPrice')
    async verifyPrice(@Body() body: VerifyPriceRequestDto): Promise<HegVerifyPriceResponse> {
        return await this.hegService.verifyPrice(body);
    }

    @Post('booking')
    async booking(@Body() body: BookingRequestDto): Promise<HegBookingResponse> {
        return await this.hegService.booking(body);
    }

    @Post('pay')
    async pay(@Body() body: PayRequestDto): Promise<HegPaymentResponse> {
        return await this.hegService.pay(body);
    }

    @Get('order')
    async order(@Body() body: QueryOrderRequestDto): Promise<HegQueryOrderResponse> {
        return await this.hegService.queryOrder(body);
    }

    @Get('ssr')
    async ssr(@Body() body: GetSsrRequestDto): Promise<HegSsrResponse> {
        return await this.hegService.getSsr(body);
    }
}
