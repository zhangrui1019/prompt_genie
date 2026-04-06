package com.promptgenie.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DirectorModeService {
    
    private Map<String, Scene> scenes = new ConcurrentHashMap<>();
    private Map<String, CameraSetting> cameraSettings = new ConcurrentHashMap<>();
    private Map<String, LightingSetting> lightingSettings = new ConcurrentHashMap<>();
    private Map<String, Sequence> sequences = new ConcurrentHashMap<>();
    
    public Scene createScene(String sceneId, String name, String description) {
        Scene scene = new Scene(sceneId, name, description);
        scenes.put(sceneId, scene);
        return scene;
    }
    
    public Scene getScene(String sceneId) {
        return scenes.get(sceneId);
    }
    
    public void updateScene(String sceneId, Map<String, Object> updates) {
        Scene scene = scenes.get(sceneId);
        if (scene != null) {
            if (updates.containsKey("name")) {
                scene.setName((String) updates.get("name"));
            }
            if (updates.containsKey("description")) {
                scene.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("cameraSettingId")) {
                scene.setCameraSettingId((String) updates.get("cameraSettingId"));
            }
            if (updates.containsKey("lightingSettingId")) {
                scene.setLightingSettingId((String) updates.get("lightingSettingId"));
            }
        }
    }
    
    public void deleteScene(String sceneId) {
        scenes.remove(sceneId);
    }
    
    public List<Scene> listScenes() {
        return new ArrayList<>(scenes.values());
    }
    
    public CameraSetting createCameraSetting(String settingId, String name, CameraType type, double zoom, double pan, double tilt) {
        CameraSetting setting = new CameraSetting(settingId, name, type, zoom, pan, tilt);
        cameraSettings.put(settingId, setting);
        return setting;
    }
    
    public CameraSetting getCameraSetting(String settingId) {
        return cameraSettings.get(settingId);
    }
    
    public void updateCameraSetting(String settingId, Map<String, Object> updates) {
        CameraSetting setting = cameraSettings.get(settingId);
        if (setting != null) {
            if (updates.containsKey("name")) {
                setting.setName((String) updates.get("name"));
            }
            if (updates.containsKey("type")) {
                setting.setType(CameraType.valueOf((String) updates.get("type")));
            }
            if (updates.containsKey("zoom")) {
                setting.setZoom((Double) updates.get("zoom"));
            }
            if (updates.containsKey("pan")) {
                setting.setPan((Double) updates.get("pan"));
            }
            if (updates.containsKey("tilt")) {
                setting.setTilt((Double) updates.get("tilt"));
            }
        }
    }
    
    public void deleteCameraSetting(String settingId) {
        cameraSettings.remove(settingId);
    }
    
    public List<CameraSetting> listCameraSettings() {
        return new ArrayList<>(cameraSettings.values());
    }
    
    public LightingSetting createLightingSetting(String settingId, String name, LightingType type, double intensity, String color) {
        LightingSetting setting = new LightingSetting(settingId, name, type, intensity, color);
        lightingSettings.put(settingId, setting);
        return setting;
    }
    
    public LightingSetting getLightingSetting(String settingId) {
        return lightingSettings.get(settingId);
    }
    
    public void updateLightingSetting(String settingId, Map<String, Object> updates) {
        LightingSetting setting = lightingSettings.get(settingId);
        if (setting != null) {
            if (updates.containsKey("name")) {
                setting.setName((String) updates.get("name"));
            }
            if (updates.containsKey("type")) {
                setting.setType(LightingType.valueOf((String) updates.get("type")));
            }
            if (updates.containsKey("intensity")) {
                setting.setIntensity((Double) updates.get("intensity"));
            }
            if (updates.containsKey("color")) {
                setting.setColor((String) updates.get("color"));
            }
        }
    }
    
    public void deleteLightingSetting(String settingId) {
        lightingSettings.remove(settingId);
    }
    
    public List<LightingSetting> listLightingSettings() {
        return new ArrayList<>(lightingSettings.values());
    }
    
    public Sequence createSequence(String sequenceId, String name, String description) {
        Sequence sequence = new Sequence(sequenceId, name, description);
        sequences.put(sequenceId, sequence);
        return sequence;
    }
    
    public Sequence getSequence(String sequenceId) {
        return sequences.get(sequenceId);
    }
    
    public void addSceneToSequence(String sequenceId, String sceneId, int position) {
        Sequence sequence = sequences.get(sequenceId);
        if (sequence != null) {
            sequence.addScene(sceneId, position);
        }
    }
    
    public void removeSceneFromSequence(String sequenceId, String sceneId) {
        Sequence sequence = sequences.get(sequenceId);
        if (sequence != null) {
            sequence.removeScene(sceneId);
        }
    }
    
    public void reorderScenesInSequence(String sequenceId, List<String> sceneIds) {
        Sequence sequence = sequences.get(sequenceId);
        if (sequence != null) {
            sequence.setSceneOrder(sceneIds);
        }
    }
    
    public void updateSequence(String sequenceId, Map<String, Object> updates) {
        Sequence sequence = sequences.get(sequenceId);
        if (sequence != null) {
            if (updates.containsKey("name")) {
                sequence.setName((String) updates.get("name"));
            }
            if (updates.containsKey("description")) {
                sequence.setDescription((String) updates.get("description"));
            }
        }
    }
    
    public void deleteSequence(String sequenceId) {
        sequences.remove(sequenceId);
    }
    
    public List<Sequence> listSequences() {
        return new ArrayList<>(sequences.values());
    }
    
    public String generateDirectorScript(String sequenceId) {
        Sequence sequence = sequences.get(sequenceId);
        if (sequence == null) {
            return "Sequence not found";
        }
        
        StringBuilder script = new StringBuilder();
        script.append("DIRECTOR SCRIPT: " + sequence.getName() + "\n");
        script.append("DESCRIPTION: " + sequence.getDescription() + "\n\n");
        
        List<String> sceneIds = sequence.getSceneOrder();
        for (int i = 0; i < sceneIds.size(); i++) {
            String sceneId = sceneIds.get(i);
            Scene scene = scenes.get(sceneId);
            if (scene != null) {
                script.append("SCENE " + (i + 1) + ": " + scene.getName() + "\n");
                script.append("DESCRIPTION: " + scene.getDescription() + "\n");
                
                if (scene.getCameraSettingId() != null) {
                    CameraSetting cameraSetting = cameraSettings.get(scene.getCameraSettingId());
                    if (cameraSetting != null) {
                        script.append("CAMERA: " + cameraSetting.getName() + " (" + cameraSetting.getType() + ")\n");
                        script.append("  Zoom: " + cameraSetting.getZoom() + ", Pan: " + cameraSetting.getPan() + ", Tilt: " + cameraSetting.getTilt() + "\n");
                    }
                }
                
                if (scene.getLightingSettingId() != null) {
                    LightingSetting lightingSetting = lightingSettings.get(scene.getLightingSettingId());
                    if (lightingSetting != null) {
                        script.append("LIGHTING: " + lightingSetting.getName() + " (" + lightingSetting.getType() + ")\n");
                        script.append("  Intensity: " + lightingSetting.getIntensity() + ", Color: " + lightingSetting.getColor() + "\n");
                    }
                }
                
                script.append("\n");
            }
        }
        
        return script.toString();
    }
    
    public enum CameraType {
        WIDE, MEDIUM, CLOSE_UP, EXTREME_CLOSE_UP, PANORAMIC
    }
    
    public enum LightingType {
        KEY, FILL, BACK, SIDE, AMBIENT
    }
    
    public static class Scene {
        private String id;
        private String name;
        private String description;
        private String cameraSettingId;
        private String lightingSettingId;
        
        public Scene(String id, String name, String description) {
            this.id = id;
            this.name = name;
            this.description = description;
        }
        
        public String getId() {
            return id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getCameraSettingId() {
            return cameraSettingId;
        }
        
        public void setCameraSettingId(String cameraSettingId) {
            this.cameraSettingId = cameraSettingId;
        }
        
        public String getLightingSettingId() {
            return lightingSettingId;
        }
        
        public void setLightingSettingId(String lightingSettingId) {
            this.lightingSettingId = lightingSettingId;
        }
    }
    
    public static class CameraSetting {
        private String id;
        private String name;
        private CameraType type;
        private double zoom;
        private double pan;
        private double tilt;
        
        public CameraSetting(String id, String name, CameraType type, double zoom, double pan, double tilt) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.zoom = zoom;
            this.pan = pan;
            this.tilt = tilt;
        }
        
        public String getId() {
            return id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public CameraType getType() {
            return type;
        }
        
        public void setType(CameraType type) {
            this.type = type;
        }
        
        public double getZoom() {
            return zoom;
        }
        
        public void setZoom(double zoom) {
            this.zoom = zoom;
        }
        
        public double getPan() {
            return pan;
        }
        
        public void setPan(double pan) {
            this.pan = pan;
        }
        
        public double getTilt() {
            return tilt;
        }
        
        public void setTilt(double tilt) {
            this.tilt = tilt;
        }
    }
    
    public static class LightingSetting {
        private String id;
        private String name;
        private LightingType type;
        private double intensity;
        private String color;
        
        public LightingSetting(String id, String name, LightingType type, double intensity, String color) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.intensity = intensity;
            this.color = color;
        }
        
        public String getId() {
            return id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public LightingType getType() {
            return type;
        }
        
        public void setType(LightingType type) {
            this.type = type;
        }
        
        public double getIntensity() {
            return intensity;
        }
        
        public void setIntensity(double intensity) {
            this.intensity = intensity;
        }
        
        public String getColor() {
            return color;
        }
        
        public void setColor(String color) {
            this.color = color;
        }
    }
    
    public static class Sequence {
        private String id;
        private String name;
        private String description;
        private List<String> sceneOrder;
        
        public Sequence(String id, String name, String description) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.sceneOrder = new ArrayList<>();
        }
        
        public String getId() {
            return id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public List<String> getSceneOrder() {
            return sceneOrder;
        }
        
        public void setSceneOrder(List<String> sceneOrder) {
            this.sceneOrder = sceneOrder;
        }
        
        public void addScene(String sceneId, int position) {
            if (position >= 0 && position <= sceneOrder.size()) {
                sceneOrder.add(position, sceneId);
            } else {
                sceneOrder.add(sceneId);
            }
        }
        
        public void removeScene(String sceneId) {
            sceneOrder.remove(sceneId);
        }
    }
}