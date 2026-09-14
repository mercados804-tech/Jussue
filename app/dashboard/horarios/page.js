'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSchedules, updateSchedules, getBlockedDates, createBlockedDate, deleteBlockedDate } from '@/services/business'
import { getDayOfWeekNames, cn, toISODate } from '@/utils'
import { ClockIcon, CalendarIcon, PlusIcon, TrashIcon, XIcon, CheckIcon } from '@/components/Icons'

export default function HorariosPage() {
  const [schedules, setSchedules] = useState([])
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [addingBlocked, setAddingBlocked] = useState(false)

  const load = async () => {
    try {
      const [s, b] = await Promise.all([
        getSchedules(),
        getBlockedDates(),
      ])
      setSchedules(s)
      setBlocked(b)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const showToast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 3000)
  }

  const toggleDay = (dow) => {
    setSchedules((prev) =>
      prev.map((s) => s.day_of_week === dow ? { ...s, active: !s.active } : s)
    )
  }

  const updateField = (dow, field, value) => {
    setSchedules((prev) =>
      prev.map((s) => s.day_of_week === dow ? { ...s, [field]: value } : s)
    )
  }

  const handleSaveSchedules = async () => {
    setSaving(true)
    try {
      await updateSchedules(schedules)
      showToast('Horarios guardados')
      load()
    } catch (e) {
      console.error(e)
      showToast('Error al guardar')
    } finally { setSaving(false) }
  }

  const handleAddBlocked = async (e) => {
    e.preventDefault()
    if (!blockDate) return
    setAddingBlocked(true)
    try {
      await createBlockedDate({ date: blockDate, reason: blockReason?.trim() || null })
      setBlockDate('')
      setBlockReason('')
      showToast('Fecha bloqueada agregada')
      load()
    } catch (e) {
      console.error(e)
      showToast(e.message?.includes('duplicate') ? 'Esa fecha ya está bloqueada' : 'Error')
    } finally { setAddingBlocked(false) }
  }

  const handleRemoveBlocked = async (id) => {
    try {
      await deleteBlockedDate(id)
      showToast('Fecha desbloqueada')
      load()
    } catch (e) {
      console.error(e)
      showToast('Error')
    }
  }

  const dayNames = getDayOfWeekNames()

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 glass-strong rounded-2xl px-5 py-3 border border-gold-500/30"
        >
          <div className="text-sm text-white font-medium">{toast}</div>
        </motion.div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Gestión de horarios</h1>
        <p className="text-gray-400 text-sm">Configurá días laborales, horarios y fechas bloqueadas</p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-xl font-semibold text-white mb-1 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gold-400" /> Horarios semanales
              </h2>
              <p className="text-gray-500 text-sm">Activá los días y configurá el rango horario</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSchedules}
              disabled={saving || loading}
              className="btn-gold text-sm py-2 px-5 rounded-xl flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
              Guardar cambios
            </motion.button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">Cargando...</div>
          ) : (
            <div className="space-y-2">
              {dayNames.map((name, dow) => {
                const s = schedules.find((x) => x.day_of_week === dow)
                if (!s) return null
                return (
                  <div
                    key={dow}
                    className={cn(
                      'grid grid-cols-[1fr_auto] md:grid-cols-[140px_1fr_auto] gap-3 md:gap-4 items-center p-4 rounded-2xl border transition-all',
                      s.active
                        ? 'bg-dark-800/40 border-gold-500/20'
                        : 'bg-white/[0.02] border-white/5 opacity-60',
                    )}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className={cn(
                        'w-10 h-6 rounded-full relative transition-colors cursor-pointer',
                        s.active ? 'bg-gold-500/80' : 'bg-white/10',
                      )}>
                        <div
                          onClick={() => toggleDay(dow)}
                          className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all',
                            s.active ? 'left-[calc(100%-1.375rem)]' : 'left-0.5',
                          )}
                        />
                      </div>
                      <input type="checkbox" className="hidden" checked={s.active} onChange={() => toggleDay(dow)} />
                      <span className={cn('font-medium text-sm', s.active ? 'text-white' : 'text-gray-400')}>
                        {name}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 md:gap-3 md:justify-start">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={s.start_time || '09:00'}
                          disabled={!s.active}
                          onChange={(e) => updateField(dow, 'start_time', e.target.value)}
                          className="bg-dark-900/80 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500/50 disabled:opacity-40"
                        />
                        <span className="text-gray-500 text-sm">a</span>
                        <input
                          type="time"
                          value={s.end_time || '19:00'}
                          disabled={!s.active}
                          onChange={(e) => updateField(dow, 'end_time', e.target.value)}
                          className="bg-dark-900/80 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500/50 disabled:opacity-40"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-right">
                      {s.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600" /> Cerrado
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-xl font-semibold text-white mb-1 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gold-400" /> Fechas bloqueadas
              </h2>
              <p className="text-gray-500 text-sm">Vacaciones, feriados o días sin atención</p>
            </div>
          </div>

          <form onSubmit={handleAddBlocked} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto] gap-3 mb-5">
            <input
              type="date"
              min={toISODate(new Date())}
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Motivo (opcional): Vacaciones, Feriado..."
              className="input-field"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={addingBlocked || !blockDate}
              className="btn-gold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {addingBlocked ? (
                <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
              Bloquear
            </motion.button>
          </form>

          {blocked.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <CalendarIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <div className="text-white font-medium mb-1">Sin fechas bloqueadas</div>
              <div className="text-gray-500 text-sm">Agregá feriados o vacaciones arriba</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {blocked.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/15"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <XIcon className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {new Date(b.date).toLocaleDateString('es-AR', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </div>
                      {b.reason && (
                        <div className="text-gray-500 text-xs">{b.reason}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBlocked(b.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Desbloquear"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
