// UI 관리 모듈
const UI = (() => {
    // 초기화
    function init() {
        console.log("UI 초기화 중...");
        
        // 초기 UI 설정
        updateStageInfo();
        updateMercenaryList();
        updateBattleUI();
        clearBattleLog();
        
        // 보상 팝업 닫기 버튼
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-reward-popup')) {
                document.getElementById('reward-popup').style.display = 'none';
            }
        });
    }
    
    // 스테이지 정보 업데이트
    function updateStageInfo() {
        const gameState = Game.getState();
        
        // 추후 스테이지 정보 UI 추가시 구현
        document.title = `턴제 자동 전투 RPG - 스테이지 ${gameState.currentStage}`;
    }
    
    // 용병 목록 업데이트
    function updateMercenaryList() {
        const gameState = Game.getState();
        const mercenaryList = document.querySelector('#mercenary-panel .mercenary-list');
        
        if (!mercenaryList) return;
        
        // 용병 목록 초기화
        mercenaryList.innerHTML = '';
        
        // 용병 목록 생성
        gameState.playerMercenaries.forEach(mercenary => {
            const mercenaryItem = document.createElement('div');
            mercenaryItem.className = 'mercenary-item';
            mercenaryItem.dataset.id = mercenary.id;
            
            mercenaryItem.innerHTML = `
                <div class="mercenary-icon" style="background-image: url('assets/${mercenary.class}.png');"></div>
                <div class="mercenary-details">
                    <div class="mercenary-name">${mercenary.name}</div>
                    <div class="mercenary-class">${mercenary.class.charAt(0).toUpperCase() + mercenary.class.slice(1)} Lv.${mercenary.level}</div>
                </div>
            `;
            
            // 클릭 이벤트 추가 (용병 정보 표시)
            mercenaryItem.addEventListener('click', () => {
                showMercenaryInfo(mercenary);
            });
            
            mercenaryList.appendChild(mercenaryItem);
        });
    }
    
    // 용병 정보 표시
    function showMercenaryInfo(mercenary) {
        const modal = document.getElementById('mercenary-modal');
        const modalBody = modal.querySelector('.modal-body');
        
        if (!modal || !modalBody) return;
        
        // 용병 정보 설정
        modalBody.innerHTML = `
            <div class="mercenary-detail">
                <div class="mercenary-portrait" style="background-color: #3a3f48; width: 80px; height: 120px; margin: 0 auto 15px; background-image: url('assets/${mercenary.class}.png'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
                <div class="mercenary-info">
                    <h3>${mercenary.name}</h3>
                    <p>클래스: ${mercenary.class.charAt(0).toUpperCase() + mercenary.class.slice(1)} (Lv.${mercenary.level})</p>
                    <div class="stat-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 10px 0;">
                        <div>HP: ${mercenary.hp}/${mercenary.maxHp}</div>
                        <div>공격력: ${mercenary.atk}</div>
                        <div>방어력: ${mercenary.def}</div>
                        <div>지력: ${mercenary.int}</div>
                        <div>힘: ${mercenary.str}</div>
                        <div>용맹: ${mercenary.valor}</div>
                        <div>무게: ${mercenary.weight}</div>
                    </div>
                    <div class="skill-list">
                        <h4>스킬:</h4>
                        ${mercenary.skills.map((skill, index) => `
                            <div class="skill-item" style="margin-bottom: 8px;">
                                <p><strong>${index + 1}. ${skill.name}</strong> - ${skill.description}</p>
                                <small>${getSkillTypeText(skill.type)}, 사용 확률: ${getSkillProbability(index)}%</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="equipment" style="margin-top: 15px;">
                        <h4>장비:</h4>
                        <div>무기: ${mercenary.equipment.weapon ? mercenary.equipment.weapon.name : '없음'}</div>
                        <div>방어구: ${mercenary.equipment.armor ? mercenary.equipment.armor.name : '없음'}</div>
                        <div>장신구: ${mercenary.equipment.accessory ? mercenary.equipment.accessory.name : '없음'}</div>
                    </div>
                </div>
            </div>
        `;
        
        // 모달 표시
        modal.style.display = 'flex';
    }
    
    // 스킬 유형 텍스트 반환
    function getSkillTypeText(type) {
        switch (type) {
            case 'individual': return '개별 공격';
            case 'all': return '전체 공격';
            case 'penetrate': return '관통 공격';
            case 'snipe': return '저격 공격';
            case 'heal': return '치유';
            case 'buff': return '버프';
            case 'debuff': return '디버프';
            case 'shield': return '방어막';
            case 'passive': return '패시브';
            default: return type;
        }
    }
    
    // 스킬 사용 확률 반환
    function getSkillProbability(index) {
        switch (index) {
            case 0: return 60;  // 첫 번째 스킬 (60%)
            case 1: return 40;  // 두 번째 스킬 (40%)
            case 2: return 20;  // 세 번째 스킬 (20%)
            default: return 0;
        }
    }
    
    // 전투 UI 업데이트
    function updateBattleUI() {
        const gameState = Game.getState();
        
        // 전투 컨트롤 버튼 상태 업데이트
        const startBattleBtn = document.getElementById('start-battle');
        const autoBattleBtn = document.getElementById('auto-battle');
        const skipBattleBtn = document.getElementById('skip-battle');
        const retreatBtn = document.getElementById('retreat');
        
        if (gameState.inBattle) {
            startBattleBtn.disabled = true;
            skipBattleBtn.disabled = false;
            retreatBtn.disabled = false;
        } else {
            startBattleBtn.disabled = false;
            skipBattleBtn.disabled = true;
            retreatBtn.disabled = true;
            
            // 자동 전투 버튼 초기화
            autoBattleBtn.textContent = "자동 전투";
            autoBattleBtn.style.backgroundColor = "#d35400";
        }
    }
    
    // 전투 로그 초기화
    function clearBattleLog() {
        const battleLog = document.getElementById('battle-log');
        if (battleLog) {
            battleLog.innerHTML = '';
        }
    }
    
    // 전투 로그 추가
    function addBattleLog(message) {
        const battleLog = document.getElementById('battle-log');
        if (!battleLog) return;
        
        const logEntry = document.createElement('p');
        logEntry.innerHTML = message;
        
        // 로그 클래스 추가 (색상 구분)
        if (message.includes('데미지')) {
            logEntry.classList.add('damage');
        } else if (message.includes('회복')) {
            logEntry.classList.add('heal');
        } else if (message.includes('방어막')) {
            logEntry.classList.add('shield');
        } else if (message.includes('스킬')) {
            logEntry.classList.add('skill');
        }
        
        battleLog.appendChild(logEntry);
        
        // 스크롤을 가장 아래로 이동
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    // 보상 표시
    function showRewards(rewards) {
        // 보상 팝업 생성 또는 가져오기
        let rewardPopup = document.getElementById('reward-popup');
        
        if (!rewardPopup) {
            rewardPopup = document.createElement('div');
            rewardPopup.id = 'reward-popup';
            rewardPopup.className = 'modal';
            document.body.appendChild(rewardPopup);
        }
        
        // 보상 내용 설정
        rewardPopup.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">전투 승리!</div>
                    <button class="modal-close close-reward-popup">&times;</button>
                </div>
                <div class="modal-body">
                    <h3 style="text-align: center; margin-bottom: 20px;">보상 획득</h3>
                    <div class="rewards-list" style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="reward-item" style="display: flex; align-items: center; gap: 10px;">
                            <div class="reward-icon" style="width: 40px; height: 40px; background-color: gold; border-radius: 50%;"></div>
                            <div class="reward-info">
                                <div class="reward-name">골드</div>
                                <div class="reward-amount">${rewards.gold}</div>
                            </div>
                        </div>
                        <div class="reward-item" style="display: flex; align-items: center; gap: 10px;">
                            <div class="reward-icon" style="width: 40px; height: 40px; background-color: purple; border-radius: 50%;"></div>
                            <div class="reward-info">
                                <div class="reward-name">경험치</div>
                                <div class="reward-amount">${rewards.exp}</div>
                            </div>
                        </div>
                        ${rewards.items.map(item => `
                            <div class="reward-item" style="display: flex; align-items: center; gap: 10px;">
                                <div class="reward-icon" style="width: 40px; height: 40px; background-color: #3498db; border-radius: 50%;"></div>
                                <div class="reward-info">
                                    <div class="reward-name">${item.name}</div>
                                    <div class="reward-description">${item.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-button primary close-reward-popup">확인</button>
                </div>
            </div>
        `;
        
        // 팝업 표시
        rewardPopup.style.display = 'flex';
    }
    
    // 공개 메서드
    return {
        init,
        updateStageInfo,
        updateMercenaryList,
        updateBattleUI,
        clearBattleLog,
        addBattleLog,
        showRewards,
        showMercenaryInfo
    };
})();