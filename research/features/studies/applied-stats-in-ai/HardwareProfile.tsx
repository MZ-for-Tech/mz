"use client";

import React from "react";
import { Cpu, HardDrive, Terminal, Activity } from "lucide-react";

export default function HardwareProfile() {
  return (
    <div className="w-full bg-ink text-paper rounded-sm p-8 my-12 relative overflow-hidden ">
      <div className="absolute top-0 end-0 p-12 opacity-10 rotate-12">
        <Cpu className="w-48 h-48" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-paper/10">
          <div className="p-3 bg-paper/10 rounded-sm">
            <Activity className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-latex font-bold tracking-tight">Hardware Profiling Audit</h3>
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">System Audit & Reproducibility Specs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Hardware */}
          <div className="space-y-8">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-accent flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Hardware Stack
            </h4>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="text-xs font-mono opacity-30 w-8 mt-1">GPU</div>
                <div>
                  <div className="text-sm font-bold">NVIDIA T4 Tensor Core</div>
                  <div className="text-xs opacity-60">16GB GDDR6 • Turing Architecture</div>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="text-xs font-mono opacity-30 w-8 mt-1">CPU</div>
                <div>
                  <div className="text-sm font-bold">Intel Xeon Processor</div>
                  <div className="text-xs opacity-60">2 vCPUs @ 2.20GHz (Cloud Instance)</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-xs font-mono opacity-30 w-8 mt-1">RAM</div>
                <div>
                  <div className="text-sm font-bold">12.7 GB System RAM</div>
                  <div className="text-xs opacity-60">Google Colab Runtime Environment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Software */}
          <div className="space-y-8">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-accent flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Software Stack
            </h4>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="text-xs font-mono opacity-30 w-8 mt-1">OS</div>
                <div>
                  <div className="text-sm font-bold">Ubuntu 22.04 LTS</div>
                  <div className="text-xs opacity-60">Linux Kernel (Colab Container)</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-xs font-mono opacity-30 w-8 mt-1">ENV</div>
                <div>
                  <div className="text-sm font-bold">Python 3.10.x</div>
                  <div className="text-xs opacity-60">PyTorch 2.x • CUDA 12.x Support</div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="text-xs font-mono opacity-30 w-8 mt-1">DATA</div>
                <div>
                  <div className="text-sm font-bold">medmnist v3.0.2</div>
                  <div className="text-xs opacity-60">BloodMNIST+ (224px native resolution)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-paper/10 flex justify-between items-center text-xs font-mono opacity-30 uppercase tracking-tighter">
          <span>Benchmarked @ Batch Size 32</span>
          <span>Floating Point Precision: FP32</span>
          <span>Inference Context: Local/Non-Distributed</span>
        </div>
      </div>
    </div>
  );
}
