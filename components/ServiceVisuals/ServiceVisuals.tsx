import styles from './ServiceVisuals.module.css';

export function BuildVisual() {
  return (
    <div className={styles.container}>
      <div className={styles.scaleWrapper}>
        <div className={styles.buildContainer}>
          {/* Stage 1: Terminal / Code */}
          <div className={styles.terminalWindow}>
            <div className={styles.windowHeader}>
              <div className={styles.dots}><span/><span/><span/></div>
              <div className={styles.windowTitle}>bash</div>
            </div>
            <div className={styles.terminalBody}>
              <span className={styles.cmd}>&gt; initializing core...</span>
              <span className={styles.cmd}>&gt; building architecture...</span>
              <span className={styles.cmd}>&gt; compiling components...</span>
              <span className={styles.cmdSuccess}>✓ success in 24ms</span>
            </div>
          </div>

          {/* Stage 2: Blueprint / Wireframe */}
          <div className={styles.blueprintWindow}>
             <div className={styles.bpHeader}>
                <div className={styles.bpHeaderLine} />
             </div>
             <div className={styles.bpBody}>
               <div className={styles.bpSidebar}>
                  <div className={styles.bpSidebarItem} />
                  <div className={styles.bpSidebarItem} />
               </div>
               <div className={styles.bpContent}>
                  <div className={styles.bpChart} />
                  <div className={styles.bpCards}>
                    <div className={styles.bpCard} />
                    <div className={styles.bpCard} />
                  </div>
               </div>
             </div>
             <div className={styles.bpScanLine} />
          </div>

          {/* Stage 3: Polished Dashboard */}
          <div className={styles.polishedWindow}>
             <div className={styles.polHeader}>
                <div className={styles.polLogo} />
                <div className={styles.polHeaderNav} />
             </div>
             <div className={styles.polBody}>
               <div className={styles.polSidebar}>
                 <div className={`${styles.polSidebarItem} ${styles.active}`} />
                 <div className={styles.polSidebarItem} />
               </div>
               <div className={styles.polContent}>
                  <div className={styles.polWidget}>
                    <div className={styles.polWidgetTitle} />
                    <div className={styles.polGraph} />
                  </div>
                  <div className={styles.polGrid}>
                    <div className={styles.polCard}>
                       <div className={styles.polCardData} />
                       <div className={styles.polCardLabel} />
                    </div>
                    <div className={styles.polCard}>
                       <div className={styles.polCardData} />
                       <div className={styles.polCardLabel} />
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeployVisual() {
  return (
    <div className={styles.container}>
      <div className={styles.scaleWrapper}>
        <div className={styles.deployContainer}>
          {/* Stage 1: Bloated Generic Model */}
          <div className={styles.stage1Model}>
             <div className={styles.bloatHeader}>GENERIC LLM API</div>
             <div className={styles.bloatStats}>
               <span className={styles.statRed}>Parameters: 175B</span>
               <span className={styles.statRed}>Latency: 2.4s</span>
             </div>
             <div className={styles.bloatNet}>
               {Array.from({length: 48}).map((_, i) => <div key={`s1-${i}`} className={styles.weightDot} />)}
             </div>
          </div>

          {/* Stage 2: Active Pruning */}
          <div className={styles.stage2Pruning}>
             <div className={styles.pruneLaser} />
             <div className={styles.bloatNet}>
               {Array.from({length: 48}).map((_, i) => {
                 // Keep a 4x2 core in the middle of an 8x6 grid.
                 const isKept = (i >= 18 && i <= 21) || (i >= 26 && i <= 29);
                 const pseudoRandom = ((i * 17) % 100) / 100;
                 return (
                   <div 
                     key={`s2-${i}`} 
                     className={isKept ? styles.nodeKept : styles.nodePruned} 
                     style={{ animationDelay: isKept ? '0s' : `${pseudoRandom * 2 + 1}s` }} 
                   />
                 );
               })}
             </div>
          </div>

          {/* Stage 3: Specialized Deployment */}
          <div className={styles.stage3Specialized}>
            <div className={styles.specHeader}>
              <div className={styles.specIcon} />
              <span>MZ SPECIALIZED</span>
            </div>
            <div className={styles.specStats}>
               <span className={styles.statGreen}>Parameters: 7B</span>
               <span className={styles.statGreen}>Latency: 35ms</span>
               <span className={styles.statGreen}>Cost: Zero (Local)</span>
            </div>
            <div className={styles.specCoreGrid}>
               {Array.from({length: 8}).map((_, i) => <div key={`s3-${i}`} className={styles.nodeGreen} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeachVisual() {
  return (
    <div className={styles.container}>
      <div className={styles.scaleWrapper}>
        <div className={styles.teachContainer}>
          {/* Stage 1: Chaos */}
          <div className={styles.chaosNodes}>
            <div className={styles.cNode} />
            <div className={styles.cNode} />
            <div className={styles.cNode} />
            <div className={styles.cNode} />
            <div className={styles.cNode} />
            <div className={styles.cNode} />
          </div>

          {/* Stage 2: Synthesis */}
          <div className={styles.synthesisProcess}>
            <div className={styles.synCore} />
            <div className={styles.synRing} />
            <div className={styles.synRing} style={{ animationDelay: '0.5s' }} />
            <div className={styles.synRing} style={{ animationDelay: '1s' }} />
          </div>

          {/* Stage 3: System Network */}
          <div className={styles.systemNetwork}>
            <svg className={styles.netSvg} viewBox="0 0 260 260">
              <polygon points="130,10 250,65 250,195 130,250 10,195 10,65" />
              <line x1="130" y1="130" x2="130" y2="10" />
              <line x1="130" y1="130" x2="250" y2="65" />
              <line x1="130" y1="130" x2="250" y2="195" />
              <line x1="130" y1="130" x2="130" y2="250" />
              <line x1="130" y1="130" x2="10" y2="195" />
              <line x1="130" y1="130" x2="10" y2="65" />
            </svg>
            <div className={`${styles.netNode} ${styles.n1}`} />
            <div className={`${styles.netNode} ${styles.n2}`} />
            <div className={`${styles.netNode} ${styles.n3}`} />
            <div className={`${styles.netNode} ${styles.n4}`} />
            <div className={`${styles.netNode} ${styles.n5}`} />
            <div className={`${styles.netNode} ${styles.n6}`} />
            <div className={`${styles.netNode} ${styles.nCenter}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
