import { EnumSsrCode } from "./heg.enum";

export const SsrCodeDescriptions: Record<EnumSsrCode, string> = {
    // Blind / Vision Impaired
    [EnumSsrCode.BDGP]: 'Blind passenger, guide dog onboard',
    [EnumSsrCode.BDGR]: 'Blind passenger, requires reading assistance',
    [EnumSsrCode.BLND]: 'Blind passenger',
    [EnumSsrCode.BLDP]: 'Blind passenger with personal attendant',
    [EnumSsrCode.BLDR]: 'Blind passenger, requires ramp',
    [EnumSsrCode.BLSC]: 'Blind passenger, special chair assistance',

    // Intellectual / Medical / Assistance
    [EnumSsrCode.DMAA]: 'Disabled passenger needing assistance',
    [EnumSsrCode.DEAF]: 'Deaf passenger',
    [EnumSsrCode.ESAN]: 'Special assistance needed',
    [EnumSsrCode.MAAS]: 'Medical assistance required',
    [EnumSsrCode.MEDA]: 'Medical passenger',
    [EnumSsrCode.SVAN]: 'Service animal onboard',
    [EnumSsrCode.WCOB]: 'Wheelchair onboard',
    [EnumSsrCode.WCHR]: 'Wheelchair ramp required',
    [EnumSsrCode.WCHS]: 'Wheelchair standard',
    [EnumSsrCode.WCHC]: 'Wheelchair cabin',
    [EnumSsrCode.WCMP]: 'Wheelchair must be pre-boarded',
    [EnumSsrCode.WCBD]: 'Wheelchair for boarding/deplaning',
    [EnumSsrCode.WCBW]: 'Wheelchair with bed',
    [EnumSsrCode.DPNA]: 'Disabled passenger needing assistance',
    [EnumSsrCode.UADT]: 'Unaccompanied adult passenger',

    // Special Seating
    [EnumSsrCode.BSCT]: 'Bulkhead seat',
    [EnumSsrCode.CHD]: 'Child seat',
    [EnumSsrCode.EXST]: 'Extra seat',
    [EnumSsrCode.INF]: 'Infant',
    [EnumSsrCode.INFT]: 'Infant travel',
    [EnumSsrCode.UMNR]: 'Unaccompanied minor',
    [EnumSsrCode.PETC]: 'Pet in cabin',
    [EnumSsrCode.SMED]: 'Medical stretcher',
    [EnumSsrCode.NSST]: 'No smoking seat',
    [EnumSsrCode.NSSB]: 'No smoking bulkhead seat',
    [EnumSsrCode.STCR]: 'Stretcher',
    [EnumSsrCode.SPEQ]: 'Special equipment',

    // Special Meal
    [EnumSsrCode.AVML]: 'Asian vegetarian meal',
    [EnumSsrCode.BBML]: 'Baby meal',
    [EnumSsrCode.BLML]: 'Bland meal',
    [EnumSsrCode.CHML]: 'Child meal',
    [EnumSsrCode.DBML]: 'Diabetic meal',
    [EnumSsrCode.FFML]: 'Fruit/fruit platter meal',
    [EnumSsrCode.FPML]: 'Fruit platter meal',
    [EnumSsrCode.GFML]: 'Gluten free meal',
    [EnumSsrCode.HFML]: 'High fiber meal',
    [EnumSsrCode.HNML]: 'Hindu meal',
    [EnumSsrCode.JAIN]: 'Jain meal',
    [EnumSsrCode.KSML]: 'Kosher meal',
    [EnumSsrCode.LCML]: 'Low-calorie meal',
    [EnumSsrCode.LFML]: 'Low-fat meal',
    [EnumSsrCode.LSML]: 'Low sodium meal',
    [EnumSsrCode.LPML]: 'Low protein meal',
    [EnumSsrCode.MOML]: 'Muslim meal',
    [EnumSsrCode.NLML]: 'Non-lactose meal',
    [EnumSsrCode.ORML]: 'Oriental meal',
    [EnumSsrCode.PRML]: 'Pregnancy meal',
    [EnumSsrCode.RVML]: 'Raw vegan meal',
    [EnumSsrCode.SPML]: 'Special meal',
    [EnumSsrCode.SPMLJAPANESE]: 'Special Japanese meal',
    [EnumSsrCode.VGML]: 'Vegetarian meal',
    [EnumSsrCode.VLML]: 'Vegan meal',

    // Baggage
    [EnumSsrCode.BULK]: 'Bulk baggage',
    [EnumSsrCode.CBBG]: 'Cabin baggage',

    // Other
    [EnumSsrCode.AVIH]: 'Animal in hold',
    [EnumSsrCode.BBSL]: 'Baby bassinet',
    [EnumSsrCode.LANG]: 'Language spoken',
    [EnumSsrCode.FQTV]: 'Frequent flyer program',
};