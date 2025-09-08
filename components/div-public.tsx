import { Link } from 'lucide-react'
import React from 'react'

const DivPublic = () => {
    return (
        <div className="w-full flex items-center justify-center mt-8 mb-10">
            <nav className="flex items-center gap-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800">
                <Link
                    href="/"
                    className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                    🚍 TRANSTEV - Pointage Bus
                </Link>
                <Link
                    href="/employe"
                    className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                    👤 Pointage Employé
                </Link>
            </nav>
        </div>
    )
}

export default DivPublic
