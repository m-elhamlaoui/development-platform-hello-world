package com.example.collisionservice.dto;

import java.util.List;

public class TimelineData {
    private List<String> labels;
    private List<Integer> highRisk;
    private List<Integer> mediumRisk;
    private List<Integer> lowRisk;
    private List<Integer> total;

    // Getters and Setters
    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }
    public List<Integer> getHighRisk() { return highRisk; }
    public void setHighRisk(List<Integer> highRisk) { this.highRisk = highRisk; }
    public List<Integer> getMediumRisk() { return mediumRisk; }
    public void setMediumRisk(List<Integer> mediumRisk) { this.mediumRisk = mediumRisk; }
    public List<Integer> getLowRisk() { return lowRisk; }
    public void setLowRisk(List<Integer> lowRisk) { this.lowRisk = lowRisk; }
    public List<Integer> getTotal() { return total; }
    public void setTotal(List<Integer> total) { this.total = total; }
} 