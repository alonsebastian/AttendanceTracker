import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AttendanceState {
  dates: string[]
  toggleDate: (date: string) => void
  isPresent: (date: string) => boolean
  replaceAll: (dates: string[]) => void
  mergeWith: (dates: string[]) => void
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      dates: [],

      toggleDate: (date: string) => {
        set((state) => {
          const exists = state.dates.includes(date)
          return {
            dates: exists
              ? state.dates.filter((d) => d !== date)
              : [...state.dates, date],
          }
        })
      },

      isPresent: (date: string) => {
        return get().dates.includes(date)
      },

      replaceAll: (dates: string[]) => {
        // Deduplicate the input dates
        const uniqueDates = Array.from(new Set(dates))
        set({ dates: uniqueDates })
      },

      mergeWith: (dates: string[]) => {
        set((state) => {
          // Union of existing and new dates, deduplicated
          const combined = Array.from(new Set([...state.dates, ...dates]))
          return { dates: combined }
        })
      },
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ dates: state.dates }),
    }
  )
)
