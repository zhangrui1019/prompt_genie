package com.promptgenie.service.edge;

import java.util.Map;

public interface CommunicationClient {
    /**
     * 初始化通信客户端
     */
    void initialize();

    /**
     * 连接到中心服务
     */
    void connect();

    /**
     * 断开连接
     */
    void disconnect();

    /**
     * 发送消息到中心服务
     * @param topic 消息主题
     * @param message 消息内容
     */
    void sendMessage(String topic, String message);

    /**
     * 发送消息到中心服务
     * @param topic 消息主题
     * @param message 消息内容
     * @param headers 消息头
     */
    void sendMessage(String topic, String message, Map<String, Object> headers);

    /**
     * 订阅主题
     * @param topic 主题
     * @param callback 消息回调
     */
    void subscribe(String topic, MessageCallback callback);

    /**
     * 取消订阅
     * @param topic 主题
     */
    void unsubscribe(String topic);

    /**
     * 检查连接状态
     * @return 是否连接
     */
    boolean isConnected();

    /**
     * 获取客户端ID
     * @return 客户端ID
     */
    String getClientId();

    /**
     * 关闭客户端
     */
    void close();

    /**
     * 消息回调接口
     */
    interface MessageCallback {
        /**
         * 处理接收到的消息
         * @param topic 消息主题
         * @param message 消息内容
         * @param headers 消息头
         */
        void onMessage(String topic, String message, Map<String, Object> headers);

        /**
         * 处理连接断开
         */
        void onDisconnect();

        /**
         * 处理连接成功
         */
        void onConnect();

        /**
         * 处理错误
         * @param throwable 错误
         */
        void onError(Throwable throwable);
    }
}