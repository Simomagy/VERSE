export interface UEXResponse<T> {
  status: 'ok' | 'error' | string
  data?: T
  http_code?: number
  message?: string
}

// Commodity
export interface Commodity {
  id: number
  name: string
  code: string
  slug: string
  kind: string
  is_available: number
  is_available_live: number
  is_raw: number
  is_refined: number
  is_harvestable: number
  is_temporary: number
  is_illegal: number
  is_fuel: number
}

// Commodity price (per terminal) — da commodities_prices / commodities_prices_all
export interface CommodityPrice {
  id: number
  id_commodity: number
  id_terminal: number
  id_star_system: number
  id_planet: number
  id_orbit: number
  commodity_name: string
  commodity_code: string
  terminal_name: string
  terminal_code: string
  star_system_name: string | null
  planet_name: string | null
  orbit_name: string | null
  price_buy: number
  price_buy_avg: number
  price_sell: number
  price_sell_avg: number
  scu_buy: number
  scu_buy_avg: number
  scu_sell: number
  scu_sell_avg: number
  date_modified: number
  game_version: string
  terminal_is_player_owned: number
}

// Trade route — da commodities_routes
export interface TradeRoute {
  id: number
  id_commodity: number
  id_terminal_origin: number
  id_terminal_destination: number
  id_planet_origin: number
  id_planet_destination: number
  commodity_name: string
  commodity_code: string
  origin_terminal_name: string | null
  origin_planet_name: string | null
  origin_orbit_name: string | null
  destination_terminal_name: string | null
  destination_planet_name: string | null
  destination_orbit_name: string | null
  price_origin: number
  price_destination: number
  price_margin: number
  price_roi: number
  scu_origin: number
  scu_destination: number
  investment: number
  profit: number
  score: number
  has_docking_port_origin: number
  has_docking_port_destination: number
  date_added: number
}

// Fleet vehicle — da fleet
export interface FleetVehicle {
  id: number
  id_organization: number
  id_vehicle: number
  name: string
  serial: string | null
  description: string | null
  date_added: number
  organization_name: string | null
  model_name: string
  is_hidden: number
  is_pledged: number
}

// User trade — da user_trades
export interface UserTrade {
  id: number
  id_terminal: number
  id_commodity: number
  id_user_fleet: number
  id_vehicle: number
  id_organization: number
  operation: 'buy' | 'sell'
  scu: number
  price: number
  date_added: number
  date_modified: number
  user_name: string
  user_username: string
  commodity_name: string
  terminal_name: string
  user_fleet_name: string | null
  user_fleet_serial: string | null
  vehicle_name: string | null
  organization_name: string | null
}

// Data extract
export type DataExtractType =
  | 'commodities_routes'
  | 'commodities_prices'
  | 'last_commodity_data_reports'

// App settings
export interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  notifications: boolean
  hotkey: string
}

// ─── Local data types (persisted in electron-store) ───────────────────────

// Nave nella flotta locale dell'utente
export interface LocalShip {
  id: string // uuid generato localmente
  nickname: string // nome personalizzato dall'utente
  wikiSlug: string // slug dalla Star Citizen Wiki
  wikiName: string // nome ufficiale dalla Wiki
  manufacturer: string
  role: string
  size: string
  cargoCapacity: number // SCU
  dateAdded: number // timestamp
}

// Space station — da space_stations
export interface UEXSpaceStation {
  id: number
  name: string
  nickname: string
  id_star_system: number
  has_refinery: number
  has_trade_terminal: number
  is_available: number
  is_available_live: number
  star_system_name: string | null
  planet_name: string | null
  orbit_name: string | null
}

// City — da /cities
export interface UEXCity {
  id: number
  name: string
  id_star_system: number
  has_refinery: number
  is_available: number
  is_available_live: number
  star_system_name: string | null
  planet_name: string | null
}

// Outpost — da /outposts
export interface UEXOutpost {
  id: number
  name: string
  id_star_system: number
  is_available: number
  is_available_live: number
  star_system_name: string | null
  planet_name: string | null
}

// Refinery method — da refineries_methods
export interface RefineryMethod {
  id: number
  name: string
  code: string
  rating_yield: 1 | 2 | 3 // 1=low 2=medium 3=high
  rating_cost: 1 | 2 | 3 // 1=low 2=medium 3=high
  rating_speed: 1 | 2 | 3 // 1=slow 2=medium 3=fast
  date_modified: number
}

// Refinery yield bonus per commodity/location — da refineries_yields
export interface RefineryYield {
  id: number
  id_commodity: number
  id_terminal: number
  commodity_name: string
  terminal_name: string
  star_system_name: string | null
  planet_name: string | null
  value: number // yield bonus %
  value_week: number
  value_month: number
  date_modified: number
}

// Singolo minerale all'interno di un job di raffineria
export interface RefineryMineral {
  mineral: string
  scuInput: number
  yieldPercent: number
  scuOutput: number // scuInput * yieldPercent / 100
  pricePerScu: number
  estimatedValue: number // scuOutput * pricePerScu
}

// Job di raffineria locale (salvato in electron-store)
// Un job può contenere più minerali (come nel gioco)
export interface LocalRefineryJob {
  id: string
  refinery: string
  method: string
  methodCode: string
  minerals: RefineryMineral[]
  totalEstimatedValue: number // somma di minerals[].estimatedValue
  refineCost: number
  netProfit: number // totalEstimatedValue - refineCost
  refineDurationMinutes: number // durata totale raffinazione; 0 = non impostata
  notes: string
  dateAdded: number // timestamp avvio job
}

// Voce di bilancio locale
export type WalletEntryType = 'income' | 'expense' | 'adjustment'

export interface LocalWalletEntry {
  id: string
  type: WalletEntryType
  amount: number // sempre positivo; income aggiunge, expense sottrae, adjustment resetta
  description: string
  category: string // es. "Trading", "Mining", "Refinery", "Other"
  dateAdded: number
  sourceId?: string // ID del trade che ha generato questa voce (auto-generated)
}

// Singola voce commodity all'interno di un trade
export interface TradeItem {
  commodity: string
  operation: 'buy' | 'sell'
  scu: number
  pricePerScu: number
  totalPrice: number // calcolato o inserito manualmente
}

// Trade locale — supporta più commodity per singola operazione
export interface LocalTrade {
  id: string
  shipId: string | null
  shipName: string
  locationFrom: string
  locationTo: string
  items: TradeItem[]
  totalBuy: number // somma dei buy items
  totalSell: number // somma dei sell items
  netProfit: number // totalSell - totalBuy
  notes: string
  dateAdded: number
  source?: string // origine del trade: 'refinery' | undefined
}

// ─── Star Citizen Wiki API types ───────────────────────────────────────────

export interface WikiVehicle {
  uuid: string
  name: string
  slug: string
  manufacturer: {
    name: string
    code: string
  }
  career: string
  role: string
  size: string
  cargo_capacity: number
  production_status: string
  description: string
  sizes: {
    length: number
    beam: number
    height: number
  }
}

export interface WikiVehiclesResponse {
  data: WikiVehicle[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

// ─── Wiki Star System ───────────────────────────────────────────────────────

export interface WikiAffiliation {
  id: number
  name: string
  code: string
  color: string
}

export interface WikiStarSystem {
  id: number
  code: string
  name: string
  status: string
  type: string
  position: { x: number; y: number; z: number }
  aggregated: {
    size: number
    population: number
    economy: number
    danger: number
    stars: number
    planets: number
    moons: number
    stations: number
  }
  affiliation: WikiAffiliation[]
  updated_at: string
}

export interface WikiStarSystemsResponse {
  data: WikiStarSystem[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

// ─── Wiki Celestial Object ──────────────────────────────────────────────────

export type CelestialObjectType =
  | 'PLANET'
  | 'SATELLITE'
  | 'STAR'
  | 'MANMADE'
  | 'JUMPPOINT'
  | 'ASTEROID_BELT'

export interface WikiCelestialObject {
  id: number
  code: string
  system_id: number
  name: string | null
  designation: string
  type: CelestialObjectType
  habitable: boolean | null
  parent_id: number | null
  sensor: { population: number; economy: number; danger: number }
  sub_type: { id: number | null; name: string | null; type: string | null }
  affiliation: WikiAffiliation[]
  time_modified: string
}

export interface WikiCelestialObjectsResponse {
  data: WikiCelestialObject[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}
