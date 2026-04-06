package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Transaction;
import com.promptgenie.mapper.TransactionMapper;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService extends ServiceImpl<TransactionMapper, Transaction> {
    
    @Autowired
    private TransactionMapper transactionMapper;
    
    @Autowired
    private WalletService walletService;
    
    @Autowired
    private LicenseService licenseService;
    
    @Autowired
    private PromptService promptService;
    
    @Autowired
    private UserService userService;
    
    public List<Transaction> getUserTransactions(Long userId) {
        return transactionMapper.selectByUserId(userId);
    }
    
    public List<Transaction> getBuyerTransactions(Long userId) {
        return transactionMapper.selectByBuyerId(userId);
    }
    
    public List<Transaction> getSellerTransactions(Long userId) {
        return transactionMapper.selectBySellerId(userId);
    }
    
    public List<Transaction> getPromptTransactions(Long promptId) {
        return transactionMapper.selectByPromptId(promptId);
    }
    
    public List<Transaction> getPendingTransactions() {
        return transactionMapper.selectByStatus("pending");
    }
    
    public Transaction createTransaction(Long buyerId, Long promptId) {
        // 创建交易记录
        Transaction transaction = new Transaction();
        transaction.setBuyerId(buyerId);
        // 获取卖家ID
        Long sellerId = promptService.getById(promptId).getUserId();
        transaction.setSellerId(sellerId);
        transaction.setPromptId(promptId);
        transaction.setAmount(0.0); // 暂时设置为0，后续更新
        transaction.setTransactionType("purchase");
        transaction.setStatus("pending");
        save(transaction);
        return transaction;
    }
    
    public void completeTransaction(Long transactionId) {
        Transaction transaction = getById(transactionId);
        if (transaction == null) {
            throw new RuntimeException("Transaction not found");
        }
        
        transaction.setStatus("completed");
        updateById(transaction);
    }
    
    @Transactional
    public Transaction processPurchase(Long buyerId, Long promptId, Double amount) {
        // 创建交易记录
        Transaction transaction = new Transaction();
        transaction.setBuyerId(buyerId);
        // 获取卖家ID
        Long sellerId = promptService.getById(promptId).getUserId();
        transaction.setSellerId(sellerId);
        transaction.setPromptId(promptId);
        transaction.setAmount(amount);
        transaction.setTransactionType("purchase");
        transaction.setStatus("pending");
        save(transaction);
        
        try {
            // 从买家钱包扣款
            walletService.withdraw(buyerId, amount);
            
            // 给卖家钱包存款
            walletService.deposit(sellerId, amount);
            
            // 创建许可证
            com.promptgenie.entity.License license = new com.promptgenie.entity.License();
            license.setPromptId(promptId);
            license.setUserId(buyerId);
            license.setTransactionId(transaction.getId());
            license.setStatus("active");
            licenseService.save(license);
            
            // 更新交易状态为完成
            transaction.setStatus("completed");
            updateById(transaction);
            
        } catch (Exception e) {
            // 更新交易状态为失败
            transaction.setStatus("failed");
            updateById(transaction);
            throw e;
        }
        
        return transaction;
    }
}
