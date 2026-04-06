package com.promptgenie.service.edge;

import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class MqttCommunicationClient implements CommunicationClient {

    private MqttClient client;
    private final String brokerUrl;
    private final String clientId;
    private final Map<String, MessageCallback> callbacks = new HashMap<>();

    public MqttCommunicationClient(String brokerUrl) {
        this.brokerUrl = brokerUrl;
        this.clientId = "edge-client-" + UUID.randomUUID().toString();
    }

    @Override
    public void initialize() {
        try {
            client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setConnectionTimeout(10);
            options.setKeepAliveInterval(60);

            client.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    System.out.println("Connection lost: " + cause.getMessage());
                    callbacks.values().forEach(MessageCallback::onDisconnect);
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) throws Exception {
                    String payload = new String(message.getPayload());
                    Map<String, Object> headers = new HashMap<>();
                    headers.put("qos", message.getQos());
                    headers.put("retained", message.isRetained());

                    MessageCallback callback = callbacks.get(topic);
                    if (callback != null) {
                        callback.onMessage(topic, payload, headers);
                    }
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                    // Delivery complete
                }
            });

            System.out.println("MQTT client initialized");
        } catch (MqttException e) {
            System.err.println("Failed to initialize MQTT client: " + e.getMessage());
        }
    }

    @Override
    public void connect() {
        try {
            if (client != null && !client.isConnected()) {
                client.connect();
                System.out.println("Connected to MQTT broker: " + brokerUrl);
                callbacks.values().forEach(MessageCallback::onConnect);
            }
        } catch (MqttException e) {
            System.err.println("Failed to connect to MQTT broker: " + e.getMessage());
            callbacks.values().forEach(callback -> callback.onError(e));
        }
    }

    @Override
    public void disconnect() {
        try {
            if (client != null && client.isConnected()) {
                client.disconnect();
                System.out.println("Disconnected from MQTT broker");
            }
        } catch (MqttException e) {
            System.err.println("Failed to disconnect: " + e.getMessage());
        }
    }

    @Override
    public void sendMessage(String topic, String message) {
        sendMessage(topic, message, new HashMap<>());
    }

    @Override
    public void sendMessage(String topic, String message, Map<String, Object> headers) {
        try {
            if (client != null && client.isConnected()) {
                MqttMessage mqttMessage = new MqttMessage(message.getBytes());
                mqttMessage.setQos(1); // At least once delivery
                mqttMessage.setRetained(false);
                client.publish(topic, mqttMessage);
                System.out.println("Message sent to topic " + topic + ": " + message);
            } else {
                System.err.println("Cannot send message: MQTT client not connected");
            }
        } catch (MqttException e) {
            System.err.println("Failed to send message: " + e.getMessage());
            callbacks.values().forEach(callback -> callback.onError(e));
        }
    }

    @Override
    public void subscribe(String topic, MessageCallback callback) {
        try {
            if (client != null && client.isConnected()) {
                client.subscribe(topic, 1);
                callbacks.put(topic, callback);
                System.out.println("Subscribed to topic: " + topic);
            } else {
                System.err.println("Cannot subscribe: MQTT client not connected");
            }
        } catch (MqttException e) {
            System.err.println("Failed to subscribe: " + e.getMessage());
            callback.onError(e);
        }
    }

    @Override
    public void unsubscribe(String topic) {
        try {
            if (client != null && client.isConnected()) {
                client.unsubscribe(topic);
                callbacks.remove(topic);
                System.out.println("Unsubscribed from topic: " + topic);
            }
        } catch (MqttException e) {
            System.err.println("Failed to unsubscribe: " + e.getMessage());
        }
    }

    @Override
    public boolean isConnected() {
        return client != null && client.isConnected();
    }

    @Override
    public String getClientId() {
        return clientId;
    }

    @Override
    public void close() {
        try {
            if (client != null) {
                if (client.isConnected()) {
                    client.disconnect();
                }
                client.close();
                System.out.println("MQTT client closed");
            }
        } catch (MqttException e) {
            System.err.println("Failed to close MQTT client: " + e.getMessage());
        }
    }
}