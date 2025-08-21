// Tipos para el endpoint search/insert
export interface SearchInsertRequest {
  location_google_search: string;
  latitude: number;
  longitude: number;
  distance_radius: number;
  location_search: string;
  SearchType: string;
  Start: string;
  End: string;
  PartyType: string;
  MaxRooms: number;
  Nights: number;
  Channel: number;
  RateType: string;
  Pos: string;
  Lng: string;
  Currency: string;
  MaxAgeChildrenNumber: number;
  MaxAgeBabiesNumber: number;
  ReturnUrl: string;
  FromUrl: string;
  Tag: string;
  Source: string;
  ProductTimezone: string;
  SearchID?: number;
  Type: string;
  Device: string;
  tag: string;
  UserType: string;
  AgreementType: string;
  GroupsForm: string;
  SkuID: string;
  MinNights: number;
}

export interface SearchInsertResponse {
  Time: string;
  SearchID: number;
  Response: number;
  Pos: string;
  Name: string | null;
  Currency: string;
  IP: string;
  Lng: string;
  ProductID: number;
  ListID: number;
  Location: string;
  Tag: string;
  BookingTag: number;
  Email: string;
  UserID: string;
  SearchType: string;
  LocationID: string | null;
  Open: string | null;
  nationality: string | null;
  latitude: string;
  longitude: string;
  distance_radius: string;
  searchId: number;
  returnUrl: string;
  gclid: string | null;
  fbclid: string | null;
  metadata: {
    id: number;
    organization_id: string | null;
    agent_id: string | null;
    apikey_id: string | null;
    px_user_id: string;
    external_provider_id: string | null;
    external_provider_reservation_id: string | null;
    gclid: string | null;
    fbclid: string | null;
    twclid: string | null;
    awcid: string | null;
  };
}

// Tipos para el endpoint hotels/availability
export interface HotelsAvailabilityRequest {
  search_definition_id: number;
  currency: string;
  lat: number;
  lng: number;
  distance_radius: number;
  search_type: string;
  pos: string;
  order_by: string;
  pxsol_auth_token?: string;
  current_page: number;
}

export interface Hotel {
  position: number;
  provider: string;
  hotel_id: number;
  agreement: string;
  automatic_agreement: string;
  company_id: number;
  name: string;
  type: string;
  sub_type: string;
  stars: number;
  cover_photo: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  longitude: number;
  latitude: number;
  distance_from_search_coordinate: number;
  country: string;
  state: string;
  plaza: string;
  description: string;
  max_children_age: number;
  max_babies_age: number;
  lng: string;
  text_overview: string;
  text_room: string;
  availability: number;
  rate_name: string;
  location_details: {
    country: {
      code: number;
      alpha2: string;
      alpha3: string;
      german: string;
      english: string;
      french: string;
      spanish: string;
      italian: string;
    };
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    city_id: string;
  };
  booking_tag: number;
  team_id: number;
  photos: Array<{
    id: number;
    url: string;
  }>;
}

export interface HotelsAvailabilityResponse {
  data: {
    hotels: Hotel[];
  };
  meta: {
    total_hotels: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    this_page_hotels: number;
  };
}

// Tipos para el endpoint query/list6
export interface QueryList6Request {
  search: string;
  pos: string;
  lng: string;
  SearchID: number;
  ProductID: number;
  Sku: number;
  Currency: string;
  Email: string;
  Tag: string;
  order_rooms: string;
}

export interface SkuRate {
  business_rules_applied: any[];
  ID: number;
  origin_agreement: {
    agreement_chain_id: string;
    agreement_type: string;
    agreement_id: number;
    rate_plans: number[];
  };
  SkuID: number;
  Channel: string;
  PolicyID: number;
  Provider: string;
  Code: number;
  Name: string;
  Description: string;
  Src: string;
  Currency: string;
  decimals: number;
  MinBW: number;
  MaxBW: number;
  ChargeTypeCode: number;
  Breakfast: number;
  Parking: number;
  Spa: number;
  Wifi: number;
  MealPlan: any[];
  RateAmenities: Array<{
    Code: number;
    Src: string;
    Label: string;
  }>;
  AdultFixedCharge: number;
  ChildFixedCharge: number;
  COA: number;
  COD: number;
  MinLOS: number;
  MaxLOS: number;
  Availability: number;
  PeakSeason: number;
  RestrictionTxt: string;
  RestrictionInfo: string;
  RateID: number;
  RateType: number;
  RateCode: number;
  RateName: string;
  MealCode: string;
  Fee: number;
  Taxes: number;
  ClientLoad: string;
  MealPlanRates: any;
  RatePerDay: any;
}

export interface Sku {
  SkuID: number;
  RelevantRoom: number;
  SkuCode: string;
  MaxPersons: number;
  MaxChildren: number;
  MaxAdults: number;
  SkuAdults: number;
  SkuChildren: number;
  SkuBabies: number;
  Title: string;
  Description: string;
  Src: string;
  Photos: Array<{
    URL: string;
  }>;
  Amenities: Array<{
    ID: number;
    Label: string;
    Src: string;
    OTACode: number;
  }>;
  RateList: SkuRate[];
}

export interface QueryList6Response {
  Version: number;
  Time: string;
  Uri: string;
  SearchID: number;
  Email: string;
  Pos: string;
  pos_id: number;
  Currency: string;
  Type: string;
  SubType: string;
  Lng: string;
  Location: string;
  ListID: number;
  ProductID: number;
  SkuID: number;
  ShowTaxes: number;
  Taxes: number;
  BudgetID: number;
  GroupsForm: string;
  GroupNum: number;
  Missing: number;
  Adults: number;
  AdultsMin: number;
  AdultsMax: number;
  Children: number;
  Babies: number;
  Paxs: number;
  Code: string;
  Tag: string;
  BookingTag: number;
  Open: number;
  ProductList: Array<{
    Engine: number;
    Position: number;
    ProductID: number;
    Provider: string;
    TeamID: number;
    Agreement: string;
    BookingTag: number;
    AutomaticAgreement: string;
    BookingTagLabel: string;
    ValidTo: string;
    CompanyID: number;
    Plan: number;
    Title: string;
    timezone: string;
    current_time: string;
    Url: string;
    Type: string;
    Subtypes: string;
    TotalRooms: number;
    TotalSKUs: number;
    TotalPhotos: number;
    TripAdvisorID: string;
    Category: number;
    Phone: string;
    Email: string;
    Reviews: number;
    Score: number;
    ScoreText: string;
    CoverPhoto: string;
    Address: string;
    Longitude: number;
    Latitude: number;
    Country: string;
    State: string;
    Plaza: string;
    Web: string;
    BookingURL: string;
    OwnPos: string;
    ProductPos: string;
    pos_id: number;
    PosTaxes: number;
    bar_last_initialized_at: string;
    bar_last_initialization_successes: number;
    ShowTaxes: number;
    PosUrl: string;
    ReturnUrl: string;
    MaxChildrensAge: number;
    MaxBabiesAge: number;
    TxtOverview: string;
    DescriptionText: string;
    TxtRoom: string;
    TxtRoomPlural: string;
    TxtRoomShort: string;
    TxtAdults: string;
    TxtChildren: string;
    TxtTaxes: string;
    ParkingText: string;
    BreakfastText: string;
    ExchangeText: string;
    Src: string;
    Campaign: number;
    location_details: any;
    SkuList: Sku[];
  }>;
}

// Tipos para configuración de entornos
export interface Environment {
  name: string;
  api1BaseUrl: string;
  apiIntegrationBaseUrl: string;
}

// Tipos para resultados de tests
export interface TestResult {
  testId: string;
  environment: string;
  timestamp: Date;
  duration: number;
  searchInsert: {
    success: boolean;
    duration: number;
    searchId?: number;
    error?: string;
  };
  hotelsAvailability: {
    success: boolean;
    duration: number;
    hotelsCount?: number;
    availableHotelsCount?: number;
    hotels?: Array<{
      hotel_id: number;
      name: string;
      availability: number;
    }>;
    error?: string;
  };
  queryList6Results: Array<{
    hotelId: number;
    hotelName: string;
    success: boolean;
    duration: number;
    skuCount?: number;
    availableSkuCount?: number;
    availableRatesCount?: number;
    error?: string;
  }>;
  comparison: {
    totalHotelsFromAvailability: number;
    hotelsWithSupposedAvailability: number;
    hotelsTestedInList6: number;
    hotelsWithRealAvailability: number;
    accuracyPercentage: number;
    discrepancies: Array<{
      hotelId: number;
      hotelName: string;
      supposedAvailability: number;
      realAvailability: boolean;
      availableRates: number;
    }>;
  };
}

// Tipos para configuración de tests
export interface TestConfig {
  environment: Environment;
  searchParams: {
    latitude: number;
    longitude: number;
    distance_radius: number;
    start: string;
    end: string;
    location_search: string;
  };
  maxHotelsToTest?: number;
  timeout?: number;
  retries?: number;
  /**
   * Token de autenticación para API Integration. Si se provee, se usará como
   * header Authorization (Bearer) en lugar de la variable de entorno.
   */
  authToken?: string;
  /**
   * Cantidad de requests simultáneos para acelerar Query List6
   */
  concurrency?: number;
}