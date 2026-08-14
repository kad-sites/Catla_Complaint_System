package com.example.catlatechapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.google.firebase.messaging.FirebaseMessaging

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onCreate() {
        super.onCreate()
        FirebaseMessaging.getInstance().subscribeToTopic("all_technicians")
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "New Job"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: "You have been assigned a new job."
        val complaintId = remoteMessage.data["complaintId"] ?: return

        showNotification(title, body, complaintId)
    }

    override fun onNewToken(token: String) {
        // You would typically send this token to your backend here
        // so the backend knows which device to send notifications to.
        println("Firebase Token: $token")
    }

    private fun showNotification(title: String, body: String, complaintId: String) {
        val channelId = "catla_jobs"
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Job Assignments", NotificationManager.IMPORTANCE_HIGH)
            notificationManager.createNotificationChannel(channel)
        }

        // Open App Intent
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE)

        // Accept Action Intent
        val acceptIntent = Intent(this, NotificationActionReceiver::class.java).apply {
            action = "ACTION_ACCEPT"
            putExtra("complaintId", complaintId)
        }
        val acceptPendingIntent = PendingIntent.getBroadcast(this, 1, acceptIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        // Reject Action Intent
        val rejectIntent = Intent(this, NotificationActionReceiver::class.java).apply {
            action = "ACTION_REJECT"
            putExtra("complaintId", complaintId)
        }
        val rejectPendingIntent = PendingIntent.getBroadcast(this, 2, rejectIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.custom_icon)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .addAction(0, "✅ Accept", acceptPendingIntent)
            .addAction(0, "❌ Reject", rejectPendingIntent)

        notificationManager.notify(complaintId.hashCode(), notificationBuilder.build())
    }
}
