package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Transaction;
import com.promptgenie.entity.Wallet;
import com.promptgenie.mapper.WalletMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WalletService extends ServiceImpl<WalletMapper, Wallet> {
    
    @Autowired
    private WalletMapper walletMapper;
    
    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private LicenseService licenseService;
    
    public Wallet getUserWallet(Long userId) {
        Wallet wallet = walletMapper.selectByUserId(userId);
        if (wallet == null) {
            // 创建新钱包
            wallet = new Wallet();
            wallet.setUserId(userId);
            wallet.setBalance(0.0);
            wallet.setPendingBalance(0.0);
            wallet.setTotalIncome(0.0);
            wallet.setTotalWithdrawal(0.0);
            save(wallet);
        }
        return wallet;
    }
    
    @Transactional
    public void deposit(Long userId, Double amount) {
        Wallet wallet = getUserWallet(userId);
        wallet.setBalance(wallet.getBalance() + amount);
        wallet.setTotalIncome(wallet.getTotalIncome() + amount);
        updateById(wallet);
        
        // 记录交易
        Transaction transaction = new Transaction();
        transaction.setSellerId(userId);
        transaction.setAmount(amount);
        transaction.setTransactionType("deposit");
        transaction.setStatus("completed");
        transactionService.save(transaction);
    }
    
    @Transactional
    public void withdraw(Long userId, Double amount) {
        Wallet wallet = getUserWallet(userId);
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }
        
        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setTotalWithdrawal(wallet.getTotalWithdrawal() + amount);
        updateById(wallet);
        
        // 记录交易
        Transaction transaction = new Transaction();
        transaction.setBuyerId(userId);
        transaction.setAmount(amount);
        transaction.setTransactionType("withdrawal");
        transaction.setStatus("completed");
        transactionService.save(transaction);
    }
    
    @Transactional
    public void transfer(Long fromUserId, Long toUserId, Double amount) {
        Wallet fromWallet = getUserWallet(fromUserId);
        if (fromWallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }
        
        // 扣款
        fromWallet.setBalance(fromWallet.getBalance() - amount);
        updateById(fromWallet);
        
        // 存款
        Wallet toWallet = getUserWallet(toUserId);
        toWallet.setBalance(toWallet.getBalance() + amount);
        toWallet.setTotalIncome(toWallet.getTotalIncome() + amount);
        updateById(toWallet);
        
        // 记录交易
        Transaction transaction = new Transaction();
        transaction.setBuyerId(toUserId);
        transaction.setSellerId(fromUserId);
        transaction.setAmount(amount);
        transaction.setTransactionType("transfer");
        transaction.setStatus("completed");
        transactionService.save(transaction);
    }
}
