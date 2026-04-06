package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketplaceService {
    
    private final Map<String, MarketplaceItem> marketplaceItems = new ConcurrentHashMap<>();
    private final Map<String, Transaction> transactions = new ConcurrentHashMap<>();
    private final Map<String, UserBalance> userBalances = new ConcurrentHashMap<>();
    private final Map<String, Settlement> settlements = new ConcurrentHashMap<>();
    
    // 平台手续费比例
    private static final double PLATFORM_FEE_RATE = 0.1; // 10%
    
    // 初始化交易市场服务
    public void init() {
        // 初始化默认设置
    }
    
    // 发布Prompt到交易市场
    public MarketplaceItem publishPromptToMarketplace(String itemId, String promptId, String sellerId, String name, String description, Map<String, Object> pricing) {
        MarketplaceItem item = new MarketplaceItem(
            itemId,
            promptId,
            sellerId,
            name,
            description,
            pricing, // 包含价格策略和价格
            "active",
            System.currentTimeMillis()
        );
        marketplaceItems.put(itemId, item);
        
        return item;
    }
    
    // 购买Prompt
    public Transaction purchasePrompt(String transactionId, String itemId, String buyerId, String purchaseType) {
        MarketplaceItem item = marketplaceItems.get(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Marketplace item not found: " + itemId);
        }
        
        // 获取价格
        int price = getPrice(item.getPricing(), purchaseType);
        
        // 检查买家余额
        UserBalance buyerBalance = getUserBalance(buyerId);
        if (buyerBalance.getBalance() < price) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        
        // 扣减买家余额
        buyerBalance.setBalance(buyerBalance.getBalance() - price);
        
        // 计算平台手续费和卖家收益
        int platformFee = (int) (price * PLATFORM_FEE_RATE);
        int sellerRevenue = price - platformFee;
        
        // 增加卖家待结算余额
        UserBalance sellerBalance = getUserBalance(item.getSellerId());
        sellerBalance.setPendingBalance(sellerBalance.getPendingBalance() + sellerRevenue);
        
        // 创建交易记录
        Transaction transaction = new Transaction(
            transactionId,
            itemId,
            buyerId,
            item.getSellerId(),
            purchaseType,
            price,
            platformFee,
            sellerRevenue,
            "completed",
            System.currentTimeMillis()
        );
        transactions.put(transactionId, transaction);
        
        // 生成API访问权限
        String accessToken = generateAccessToken(itemId, buyerId);
        transaction.setAccessToken(accessToken);
        
        return transaction;
    }
    
    // 获取价格
    private int getPrice(Map<String, Object> pricing, String purchaseType) {
        if ("one_time".equals(purchaseType)) {
            return (int) pricing.getOrDefault("oneTimePrice", 10);
        } else if ("unlimited".equals(purchaseType)) {
            return (int) pricing.getOrDefault("unlimitedPrice", 100);
        } else {
            throw new IllegalArgumentException("Invalid purchase type: " + purchaseType);
        }
    }
    
    // 生成访问令牌
    private String generateAccessToken(String itemId, String buyerId) {
        return "token-" + itemId + "-" + buyerId + "-" + System.currentTimeMillis();
    }
    
    // 调用购买的Prompt API
    public Object callPurchasedPrompt(String itemId, String accessToken, Map<String, Object> params) {
        // 验证访问令牌
        Transaction transaction = validateAccessToken(accessToken);
        if (transaction == null || !itemId.equals(transaction.getItemId())) {
            throw new IllegalArgumentException("Invalid access token");
        }
        
        // 检查购买类型
        if ("one_time".equals(transaction.getPurchaseType())) {
            // 一次性购买，标记为已使用
            transaction.setUsed(true);
        }
        
        // 执行Prompt调用
        // 这里简化处理，实际应该调用Prompt服务
        return Map.of(
            "itemId", itemId,
            "params", params,
            "result", "Prompt executed successfully"
        );
    }
    
    // 验证访问令牌
    private Transaction validateAccessToken(String accessToken) {
        for (Transaction transaction : transactions.values()) {
            if (accessToken.equals(transaction.getAccessToken()) && "completed".equals(transaction.getStatus())) {
                if ("one_time".equals(transaction.getPurchaseType()) && transaction.isUsed()) {
                    return null; // 一次性购买已使用
                }
                return transaction;
            }
        }
        return null;
    }
    
    // 结算卖家收益
    public Settlement settleSellerRevenue(String settlementId, String sellerId) {
        UserBalance sellerBalance = getUserBalance(sellerId);
        int pendingBalance = sellerBalance.getPendingBalance();
        
        if (pendingBalance <= 0) {
            throw new IllegalArgumentException("No pending balance to settle");
        }
        
        // 转移待结算余额到可用余额
        sellerBalance.setBalance(sellerBalance.getBalance() + pendingBalance);
        sellerBalance.setPendingBalance(0);
        
        // 创建结算记录
        Settlement settlement = new Settlement(
            settlementId,
            sellerId,
            pendingBalance,
            "completed",
            System.currentTimeMillis()
        );
        settlements.put(settlementId, settlement);
        
        return settlement;
    }
    
    // 获取用户余额
    public UserBalance getUserBalance(String userId) {
        UserBalance balance = userBalances.get(userId);
        if (balance == null) {
            balance = new UserBalance(
                userId,
                1000, // 初始余额
                0, // 待结算余额
                System.currentTimeMillis()
            );
            userBalances.put(userId, balance);
        }
        return balance;
    }
    
    // 充值余额
    public void rechargeBalance(String userId, int amount) {
        UserBalance balance = getUserBalance(userId);
        balance.setBalance(balance.getBalance() + amount);
    }
    
    // 获取市场物品列表
    public List<MarketplaceItem> getMarketplaceItems(String category, String sortBy) {
        List<MarketplaceItem> items = new ArrayList<>();
        for (MarketplaceItem item : marketplaceItems.values()) {
            if ("active".equals(item.getStatus())) {
                items.add(item);
            }
        }
        
        // 排序
        switch (sortBy) {
            case "price_asc":
                items.sort(Comparator.comparingInt(item -> (int) item.getPricing().getOrDefault("oneTimePrice", 0)));
                break;
            case "price_desc":
                items.sort((a, b) -> Integer.compare(
                    (int) b.getPricing().getOrDefault("oneTimePrice", 0),
                    (int) a.getPricing().getOrDefault("oneTimePrice", 0)
                ));
                break;
            case "latest":
                items.sort(Comparator.comparingLong(MarketplaceItem::getCreatedAt).reversed());
                break;
        }
        
        return items;
    }
    
    // 获取用户购买的Prompt
    public List<Transaction> getUserPurchases(String userId) {
        List<Transaction> purchases = new ArrayList<>();
        for (Transaction transaction : transactions.values()) {
            if (userId.equals(transaction.getBuyerId()) && "completed".equals(transaction.getStatus())) {
                purchases.add(transaction);
            }
        }
        return purchases;
    }
    
    // 获取用户销售记录
    public List<Transaction> getUserSales(String userId) {
        List<Transaction> sales = new ArrayList<>();
        for (Transaction transaction : transactions.values()) {
            if (userId.equals(transaction.getSellerId()) && "completed".equals(transaction.getStatus())) {
                sales.add(transaction);
            }
        }
        return sales;
    }
    
    // 市场物品类
    public static class MarketplaceItem {
        private String id;
        private String promptId;
        private String sellerId;
        private String name;
        private String description;
        private Map<String, Object> pricing; // 包含oneTimePrice和unlimitedPrice
        private String status; // active, inactive
        private long createdAt;
        
        public MarketplaceItem(String id, String promptId, String sellerId, String name, String description, Map<String, Object> pricing, String status, long createdAt) {
            this.id = id;
            this.promptId = promptId;
            this.sellerId = sellerId;
            this.name = name;
            this.description = description;
            this.pricing = pricing;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPromptId() { return promptId; }
        public void setPromptId(String promptId) { this.promptId = promptId; }
        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Map<String, Object> getPricing() { return pricing; }
        public void setPricing(Map<String, Object> pricing) { this.pricing = pricing; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 交易类
    public static class Transaction {
        private String id;
        private String itemId;
        private String buyerId;
        private String sellerId;
        private String purchaseType; // one_time, unlimited
        private int price;
        private int platformFee;
        private int sellerRevenue;
        private String accessToken;
        private boolean used;
        private String status; // pending, completed, failed
        private long createdAt;
        
        public Transaction(String id, String itemId, String buyerId, String sellerId, String purchaseType, int price, int platformFee, int sellerRevenue, String status, long createdAt) {
            this.id = id;
            this.itemId = itemId;
            this.buyerId = buyerId;
            this.sellerId = sellerId;
            this.purchaseType = purchaseType;
            this.price = price;
            this.platformFee = platformFee;
            this.sellerRevenue = sellerRevenue;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }
        public String getBuyerId() { return buyerId; }
        public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }
        public String getPurchaseType() { return purchaseType; }
        public void setPurchaseType(String purchaseType) { this.purchaseType = purchaseType; }
        public int getPrice() { return price; }
        public void setPrice(int price) { this.price = price; }
        public int getPlatformFee() { return platformFee; }
        public void setPlatformFee(int platformFee) { this.platformFee = platformFee; }
        public int getSellerRevenue() { return sellerRevenue; }
        public void setSellerRevenue(int sellerRevenue) { this.sellerRevenue = sellerRevenue; }
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public boolean isUsed() { return used; }
        public void setUsed(boolean used) { this.used = used; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 用户余额类
    public static class UserBalance {
        private String userId;
        private int balance;
        private int pendingBalance;
        private long updatedAt;
        
        public UserBalance(String userId, int balance, int pendingBalance, long updatedAt) {
            this.userId = userId;
            this.balance = balance;
            this.pendingBalance = pendingBalance;
            this.updatedAt = updatedAt;
        }
        
        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public int getBalance() { return balance; }
        public void setBalance(int balance) { this.balance = balance; this.updatedAt = System.currentTimeMillis(); }
        public int getPendingBalance() { return pendingBalance; }
        public void setPendingBalance(int pendingBalance) { this.pendingBalance = pendingBalance; this.updatedAt = System.currentTimeMillis(); }
        public long getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }
    }
    
    // 结算类
    public static class Settlement {
        private String id;
        private String sellerId;
        private int amount;
        private String status; // pending, completed, failed
        private long createdAt;
        
        public Settlement(String id, String sellerId, int amount, String status, long createdAt) {
            this.id = id;
            this.sellerId = sellerId;
            this.amount = amount;
            this.status = status;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }
        public int getAmount() { return amount; }
        public void setAmount(int amount) { this.amount = amount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}