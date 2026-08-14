package com.example.catlatechapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.app.NotificationManager
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject
import java.io.OutputStreamWriter

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val complaintId = intent.getStringExtra("complaintId") ?: return

        val status = if (action == "ACTION_ACCEPT") "WORKING" else "REJECTED"
        val message = if (action == "ACTION_ACCEPT") "Job Accepted!" else "Job Rejected!"

        // Dismiss the notification
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(complaintId.hashCode())

        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()

        // Make network request to update status on Vercel backend
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // We will use the Vercel backend API to update it directly.
                // You need to expose an API route in Next.js for this.
                val url = URL("https://catla-complaint-system.vercel.app/api/complaints/update-status")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                val json = JSONObject()
                json.put("complaintId", complaintId)
                json.put("status", status)

                val writer = OutputStreamWriter(connection.outputStream)
                writer.write(json.toString())
                writer.flush()
                writer.close()

                val responseCode = connection.responseCode
                if (responseCode == 200) {
                    println("Status updated successfully to $status for $complaintId")
                } else {
                    println("Failed to update status. Code: $responseCode")
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
