import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { HomeView } from '../views/HomeView'
import { FleetView } from '../views/FleetView'
import { TradesView } from '../views/TradesView'
import { RefineriesView } from '../views/RefineriesView'
import { WalletView } from '../views/WalletView'
import { SettingsView } from '../views/SettingsView'
import { EquipmentView } from '../views/EquipmentView'
import { CommoditiesView } from '../views/CommoditiesView'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<HomeView />} />
        <Route path="fleet" element={<FleetView />} />
        <Route path="trades" element={<TradesView />} />
        <Route path="refinery" element={<RefineriesView />} />
        <Route path="wallet" element={<WalletView />} />
        <Route path="equipment" element={<EquipmentView />} />
        <Route path="commodities" element={<CommoditiesView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  )
}
