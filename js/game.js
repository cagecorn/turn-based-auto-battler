// 게임 전체를 관리하는 모듈
const Game = (() => {
    // 게임 상태
    let state = {
        inBattle: false,
        autoMode: false,
        currentStage: 1,
        playerMercenaries: [],
        availableMercenaries: [],
        inventory: [],
        gold: 1000
    };

    // 초기화
    function init() {
        console.log("게임 초기화 중...");
        loadGameData();
        UI.init();
        import { startBattle } from './battle.js';
startBattle();
        bindEvents();
        console.log("게임 초기화 완료!");
    }

    // 게임 데이터 로드
    function loadGameData() {
        // 로컬 스토리지에서 저장된 게임 데이터 불러오기 (향후 확장)
        const savedData = localStorage.getItem('gameData');
        
        if (savedData) {
            // 저장된 데이터가 있으면 로드
            const parsedData = JSON.parse(savedData);
            state = {...state, ...parsedData};
            console.log("저장된 게임 데이터를 불러왔습니다.");
        } else {
            // 새 게임 초기 데이터 생성
            generateInitialGameData();
            console.log("새 게임 데이터를 생성했습니다.");
        }
    }

    // 초기 게임 데이터 생성
    function generateInitialGameData() {
        // 기본 용병 생성
        state.playerMercenaries = [
            CharacterFactory.createMercenary('warrior', '강철의 로간', 5),
            CharacterFactory.createMercenary('mage', '불꽃의 아이리스', 4),
            CharacterFactory.createMercenary('healer', '빛의 미아', 3),
            CharacterFactory.createMercenary('knight', '방패의 토르', 5)
        ];
        
        // 사용 가능한 용병 목록 (고용 가능한 용병)
        state.availableMercenaries = [
            CharacterFactory.createMercenary('warrior', '분노의 바르반', 3),
            CharacterFactory.createMercenary('mage', '얼음의 엘시아', 2),
            CharacterFactory.createMercenary('archer', '바람의 아린', 4),
            CharacterFactory.createMercenary('knight', '산의 고르딘', 3)
        ];
        
        // 초기 인벤토리
        state.inventory = [
            ItemFactory.createWeapon('강철 검', 1, {str: 5, atk: 10}),
            ItemFactory.createArmor('가죽 갑옷', 1, {def: 8, weight: 2}),
            ItemFactory.createAccessory('용맹의 목걸이', 1, {valor: 5})
        ];
    }

    // 이벤트 바인딩
    function bindEvents() {
        // 전투 관련 버튼
        document.getElementById('start-battle').addEventListener('click', startBattle);
        document.getElementById('auto-battle').addEventListener('click', toggleAutoBattle);
        document.getElementById('skip-battle').addEventListener('click', skipBattle);
        document.getElementById('retreat').addEventListener('click', retreat);
        
        // 용병 목록 클릭 이벤트
        const mercenaryItems = document.querySelectorAll('.mercenary-item');
        mercenaryItems.forEach(item => {
            item.addEventListener('click', showMercenaryModal);
        });
        
        // 모달 닫기 버튼
        const modalCloseButtons = document.querySelectorAll('.modal-close, .modal-button.secondary');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', hideModals);
        });
    }

    // 전투 시작
    function startBattle() {
        if (state.inBattle) return;
        
        state.inBattle = true;
        UI.updateBattleUI();
        BattleManager.startBattle(generateEnemies());
        
        console.log("전투가 시작되었습니다!");
    }

    // 적 생성
    function generateEnemies() {
        // 현재 스테이지에 따라 적 생성
        const stage = state.currentStage;
        const enemies = [];
        
        // 스테이지에 따라 다른 적 구성 생성
        if (stage <= 5) {
            // 쉬운 적
            enemies.push(CharacterFactory.createEnemy('goblin', '고블린', stage));
            enemies.push(CharacterFactory.createEnemy('goblin', '고블린 전사', stage));
            enemies.push(CharacterFactory.createEnemy('shaman', '고블린 주술사', stage));
            if (stage > 3) {
                enemies.push(CharacterFactory.createEnemy('orc', '작은 오크', stage));
            }
        } else if (stage <= 10) {
            // 중간 난이도 적
            enemies.push(CharacterFactory.createEnemy('orc', '오크 전사', stage));
            enemies.push(CharacterFactory.createEnemy('goblin', '고블린 대장', stage));
            enemies.push(CharacterFactory.createEnemy('shaman', '오크 주술사', stage));
            enemies.push(CharacterFactory.createEnemy('archer', '고블린 궁수', stage));
        } else {
            // 어려운 적
            enemies.push(CharacterFactory.createEnemy('orc', '오크 대장', stage));
            enemies.push(CharacterFactory.createEnemy('orc', '오크 베테랑', stage));
            enemies.push(CharacterFactory.createEnemy('shaman', '오크 대주술사', stage));
            enemies.push(CharacterFactory.createEnemy('archer', '오크 명사수', stage));
        }
        
        return enemies;
    }

    // 자동 전투 토글
    function toggleAutoBattle() {
        state.autoMode = !state.autoMode;
        
        const autoButton = document.getElementById('auto-battle');
        if (state.autoMode) {
            autoButton.textContent = "자동 전투 중지";
            autoButton.style.backgroundColor = "#c0392b";
            
            if (state.inBattle) {
                BattleManager.startAutoBattle();
            } else {
                startBattle();
            }
        } else {
            autoButton.textContent = "자동 전투";
            autoButton.style.backgroundColor = "#d35400";
            BattleManager.stopAutoBattle();
        }
    }

    // 전투 건너뛰기
    function skipBattle() {
        if (!state.inBattle) return;
        BattleManager.skipBattle();
    }

    // 전투에서 후퇴
    function retreat() {
        if (!state.inBattle) return;
        
        state.inBattle = false;
        BattleManager.endBattle(false);
        UI.updateBattleUI();
        
        UI.addBattleLog("전투에서 후퇴했습니다.");
        console.log("전투에서 후퇴했습니다.");
    }

    // 용병 모달 표시
    function showMercenaryModal(event) {
        const mercenaryItem = event.currentTarget;
        const mercenaryName = mercenaryItem.querySelector('.mercenary-name').textContent;
        
        // 해당 용병 찾기
        const mercenary = state.playerMercenaries.find(merc => merc.name === mercenaryName) || 
                         state.availableMercenaries.find(merc => merc.name === mercenaryName);
        
        if (mercenary) {
            const modal = document.getElementById('mercenary-modal');
            const modalBody = modal.querySelector('.modal-body');
            
            // 모달 내용 채우기
            modalBody.innerHTML = `
                <div class="mercenary-detail">
                    <div class="mercenary-portrait" style="background-color: #3a3f48; width: 80px; height: 120px; margin: 0 auto 15px;"></div>
                    <div class="mercenary-info">
                        <h3>${mercenary.name}</h3>
                        <p>클래스: ${mercenary.class} (Lv.${mercenary.level})</p>
                        <div class="stat-grid">
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
                            <p><strong>1. ${mercenary.skills[0].name}</strong> - ${mercenary.skills[0].description}</p>
                            ${mercenary.skills.length > 1 ? `<p><strong>2. ${mercenary.skills[1].name}</strong> - ${mercenary.skills[1].description}</p>` : ''}
                            ${mercenary.skills.length > 2 ? `<p><strong>3. ${mercenary.skills[2].name}</strong> - ${mercenary.skills[2].description}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // 배치 버튼 이벤트 설정
            const placeButton = modal.querySelector('.modal-button.primary');
            placeButton.onclick = () => placeMercenary(mercenary);
            
            // 모달 표시
            modal.style.display = 'flex';
        }
    }

    // 용병 배치
    function placeMercenary(mercenary) {
        console.log(`용병 "${mercenary.name}"을(를) 전투에 배치합니다.`);
        hideModals();
        
        // 이미 배치된 용병이면 위치 변경 UI 표시
        // 그렇지 않으면 새 용병 배치
        // (향후 구현)
    }

    // 모든 모달 닫기
    function hideModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // 다음 스테이지로 이동
    function goToNextStage() {
        state.currentStage++;
        UI.updateStageInfo();
        console.log(`다음 스테이지로 이동: ${state.currentStage}`);
    }

    // 게임 데이터 저장
    function saveGameData() {
        // 게임 상태를 로컬 스토리지에 저장
        localStorage.setItem('gameData', JSON.stringify({
            currentStage: state.currentStage,
            playerMercenaries: state.playerMercenaries,
            availableMercenaries: state.availableMercenaries,
            inventory: state.inventory,
            gold: state.gold
        }));
        
        console.log("게임 데이터가 저장되었습니다.");
    }

    // 공개 메서드
    return {
        init,
        startBattle,
        generateEnemies,
        toggleAutoBattle,
        goToNextStage,
        saveGameData,
        getState: () => state
    };
})();

// 페이지 로드 시 게임 초기화
window.addEventListener('DOMContentLoaded', Game.init);
