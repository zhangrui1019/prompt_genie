package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LocalizationService {
    
    private final Map<String, Map<String, String>> languageResources = new ConcurrentHashMap<>();
    private final List<String> supportedLanguages = new ArrayList<>();
    
    // 初始化多语言服务
    public void init() {
        // 初始化支持的语言
        supportedLanguages.add("en"); // 英语
        supportedLanguages.add("zh"); // 中文
        supportedLanguages.add("es"); // 西班牙语
        supportedLanguages.add("fr"); // 法语
        supportedLanguages.add("de"); // 德语
        supportedLanguages.add("ja"); // 日语
        supportedLanguages.add("ko"); // 韩语
        
        // 初始化语言资源
        initLanguageResources();
    }
    
    // 初始化语言资源
    private void initLanguageResources() {
        // 英语资源
        Map<String, String> enResources = new HashMap<>();
        enResources.put("welcome", "Welcome to Prompt Genie");
        enResources.put("dashboard", "Dashboard");
        enResources.put("models", "Models");
        enResources.put("prompts", "Prompts");
        enResources.put("settings", "Settings");
        enResources.put("profile", "Profile");
        enResources.put("logout", "Logout");
        enResources.put("login", "Login");
        enResources.put("register", "Register");
        enResources.put("submit", "Submit");
        enResources.put("cancel", "Cancel");
        enResources.put("save", "Save");
        enResources.put("delete", "Delete");
        enResources.put("edit", "Edit");
        enResources.put("create", "Create");
        enResources.put("update", "Update");
        enResources.put("success", "Success");
        enResources.put("error", "Error");
        enResources.put("warning", "Warning");
        enResources.put("info", "Information");
        languageResources.put("en", enResources);
        
        // 中文资源
        Map<String, String> zhResources = new HashMap<>();
        zhResources.put("welcome", "欢迎使用 Prompt Genie");
        zhResources.put("dashboard", "仪表盘");
        zhResources.put("models", "模型");
        zhResources.put("prompts", "提示词");
        zhResources.put("settings", "设置");
        zhResources.put("profile", "个人资料");
        zhResources.put("logout", "登出");
        zhResources.put("login", "登录");
        zhResources.put("register", "注册");
        zhResources.put("submit", "提交");
        zhResources.put("cancel", "取消");
        zhResources.put("save", "保存");
        zhResources.put("delete", "删除");
        zhResources.put("edit", "编辑");
        zhResources.put("create", "创建");
        zhResources.put("update", "更新");
        zhResources.put("success", "成功");
        zhResources.put("error", "错误");
        zhResources.put("warning", "警告");
        zhResources.put("info", "信息");
        languageResources.put("zh", zhResources);
        
        // 西班牙语资源
        Map<String, String> esResources = new HashMap<>();
        esResources.put("welcome", "Bienvenido a Prompt Genie");
        esResources.put("dashboard", "Panel de control");
        esResources.put("models", "Modelos");
        esResources.put("prompts", "Prompts");
        esResources.put("settings", "Configuración");
        esResources.put("profile", "Perfil");
        esResources.put("logout", "Cerrar sesión");
        esResources.put("login", "Iniciar sesión");
        esResources.put("register", "Registrarse");
        esResources.put("submit", "Enviar");
        esResources.put("cancel", "Cancelar");
        esResources.put("save", "Guardar");
        esResources.put("delete", "Eliminar");
        esResources.put("edit", "Editar");
        esResources.put("create", "Crear");
        esResources.put("update", "Actualizar");
        esResources.put("success", "Éxito");
        esResources.put("error", "Error");
        esResources.put("warning", "Advertencia");
        esResources.put("info", "Información");
        languageResources.put("es", esResources);
        
        // 法语资源
        Map<String, String> frResources = new HashMap<>();
        frResources.put("welcome", "Bienvenue sur Prompt Genie");
        frResources.put("dashboard", "Tableau de bord");
        frResources.put("models", "Modèles");
        frResources.put("prompts", "Prompts");
        frResources.put("settings", "Paramètres");
        frResources.put("profile", "Profil");
        frResources.put("logout", "Déconnexion");
        frResources.put("login", "Connexion");
        frResources.put("register", "Inscription");
        frResources.put("submit", "Soumettre");
        frResources.put("cancel", "Annuler");
        frResources.put("save", "Enregistrer");
        frResources.put("delete", "Supprimer");
        frResources.put("edit", "Modifier");
        frResources.put("create", "Créer");
        frResources.put("update", "Mettre à jour");
        frResources.put("success", "Succès");
        frResources.put("error", "Erreur");
        frResources.put("warning", "Avertissement");
        frResources.put("info", "Information");
        languageResources.put("fr", frResources);
        
        // 德语资源
        Map<String, String> deResources = new HashMap<>();
        deResources.put("welcome", "Willkommen bei Prompt Genie");
        deResources.put("dashboard", "Dashboard");
        deResources.put("models", "Modelle");
        deResources.put("prompts", "Prompts");
        deResources.put("settings", "Einstellungen");
        deResources.put("profile", "Profil");
        deResources.put("logout", "Abmelden");
        deResources.put("login", "Anmelden");
        deResources.put("register", "Registrieren");
        deResources.put("submit", "Senden");
        deResources.put("cancel", "Abbrechen");
        deResources.put("save", "Speichern");
        deResources.put("delete", "Löschen");
        deResources.put("edit", "Bearbeiten");
        deResources.put("create", "Erstellen");
        deResources.put("update", "Aktualisieren");
        deResources.put("success", "Erfolg");
        deResources.put("error", "Fehler");
        deResources.put("warning", "Warnung");
        deResources.put("info", "Information");
        languageResources.put("de", deResources);
        
        // 日语资源
        Map<String, String> jaResources = new HashMap<>();
        jaResources.put("welcome", "Prompt Genieへようこそ");
        jaResources.put("dashboard", "ダッシュボード");
        jaResources.put("models", "モデル");
        jaResources.put("prompts", "プロンプト");
        jaResources.put("settings", "設定");
        jaResources.put("profile", "プロフィール");
        jaResources.put("logout", "ログアウト");
        jaResources.put("login", "ログイン");
        jaResources.put("register", "登録");
        jaResources.put("submit", "送信");
        jaResources.put("cancel", "キャンセル");
        jaResources.put("save", "保存");
        jaResources.put("delete", "削除");
        jaResources.put("edit", "編集");
        jaResources.put("create", "作成");
        jaResources.put("update", "更新");
        jaResources.put("success", "成功");
        jaResources.put("error", "エラー");
        jaResources.put("warning", "警告");
        jaResources.put("info", "情報");
        languageResources.put("ja", jaResources);
        
        // 韩语资源
        Map<String, String> koResources = new HashMap<>();
        koResources.put("welcome", "Prompt Genie에 오신 것을 환영합니다");
        koResources.put("dashboard", "대시보드");
        koResources.put("models", "모델");
        koResources.put("prompts", "프롬프트");
        koResources.put("settings", "설정");
        koResources.put("profile", "프로필");
        koResources.put("logout", "로그아웃");
        koResources.put("login", "로그인");
        koResources.put("register", "등록");
        koResources.put("submit", "제출");
        koResources.put("cancel", "취소");
        koResources.put("save", "저장");
        koResources.put("delete", "삭제");
        koResources.put("edit", "편집");
        koResources.put("create", "생성");
        koResources.put("update", "업데이트");
        koResources.put("success", "성공");
        koResources.put("error", "오류");
        koResources.put("warning", "경고");
        koResources.put("info", "정보");
        languageResources.put("ko", koResources);
    }
    
    // 获取支持的语言列表
    public List<String> getSupportedLanguages() {
        return supportedLanguages;
    }
    
    // 添加支持的语言
    public void addSupportedLanguage(String languageCode) {
        if (!supportedLanguages.contains(languageCode)) {
            supportedLanguages.add(languageCode);
        }
    }
    
    // 移除支持的语言
    public void removeSupportedLanguage(String languageCode) {
        supportedLanguages.remove(languageCode);
    }
    
    // 翻译文本
    public String translate(String key, String languageCode) {
        Map<String, String> resources = languageResources.get(languageCode);
        if (resources == null) {
            // 如果指定语言不存在，使用默认语言（英语）
            resources = languageResources.get("en");
        }
        
        String translation = resources.get(key);
        if (translation == null) {
            // 如果键不存在，返回键本身
            return key;
        }
        
        return translation;
    }
    
    // 批量翻译
    public Map<String, String> translateBatch(List<String> keys, String languageCode) {
        Map<String, String> translations = new HashMap<>();
        Map<String, String> resources = languageResources.get(languageCode);
        if (resources == null) {
            resources = languageResources.get("en");
        }
        
        for (String key : keys) {
            String translation = resources.get(key);
            translations.put(key, translation != null ? translation : key);
        }
        
        return translations;
    }
    
    // 添加语言资源
    public void addLanguageResource(String languageCode, String key, String value) {
        Map<String, String> resources = languageResources.computeIfAbsent(languageCode, k -> new HashMap<>());
        resources.put(key, value);
    }
    
    // 更新语言资源
    public void updateLanguageResource(String languageCode, String key, String value) {
        Map<String, String> resources = languageResources.get(languageCode);
        if (resources != null) {
            resources.put(key, value);
        }
    }
    
    // 删除语言资源
    public void deleteLanguageResource(String languageCode, String key) {
        Map<String, String> resources = languageResources.get(languageCode);
        if (resources != null) {
            resources.remove(key);
        }
    }
    
    // 获取语言资源
    public Map<String, String> getLanguageResources(String languageCode) {
        Map<String, String> resources = languageResources.get(languageCode);
        if (resources == null) {
            return new HashMap<>();
        }
        return new HashMap<>(resources);
    }
    
    // 导入语言资源
    public void importLanguageResources(String languageCode, Map<String, String> resources) {
        languageResources.put(languageCode, resources);
    }
    
    // 导出语言资源
    public Map<String, String> exportLanguageResources(String languageCode) {
        return getLanguageResources(languageCode);
    }
    
    // 检测语言
    public String detectLanguage(String text) {
        // 这里应该实现实际的语言检测逻辑
        // 为了演示，我们简单返回英语
        return "en";
    }
    
    // 翻译整个文本
    public String translateText(String text, String targetLanguage) {
        // 这里应该实现实际的文本翻译逻辑
        // 为了演示，我们简单返回原文
        return text;
    }
    
    // 翻译文本到多种语言
    public Map<String, String> translateTextToMultipleLanguages(String text, List<String> targetLanguages) {
        Map<String, String> translations = new HashMap<>();
        for (String language : targetLanguages) {
            translations.put(language, translateText(text, language));
        }
        return translations;
    }
}