package com.familiar.glasses

import java.security.SecureRandom

/**
 * Random 12-character demo access code displayed on the physical glasses.
 * HTTPS is NOT implemented; use on a private hotspot with TEST DATA ONLY.
 * The code is regenerated on process restart and never printed to logs.
 */
object Pairing {
    private val alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    val code: String by lazy {
        val random = SecureRandom()
        (1..12).map { alphabet[random.nextInt(alphabet.length)] }.joinToString("")
    }
}
