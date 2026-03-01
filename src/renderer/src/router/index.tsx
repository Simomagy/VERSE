import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { FleetView } from '../views/FleetView'
import { TradesView } from '../views/TradesView'
import { RefineriesView } from '../views/RefineriesView'
import { WalletView } from '../views/WalletView'
import { SettingsView } from '../views/SettingsView'
import { EquipmentView } from '../views/EquipmentView'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/fleet" replace />} />
        <Route path="fleet" element={<FleetView />} />
        <Route path="trades" element={<TradesView />} />
        <Route path="refinery" element={<RefineriesView />} />
        <Route path="wallet" element={<WalletView />} />
        <Route path="equipment" element={<EquipmentView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/fleet" replace />} />
      </Route>
    </Routes>
  )
}
