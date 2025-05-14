// 전투 관리 모듈
const BattleManager = (() => {
    // 전투 상태
    let battleState = {
        inProgress: false,
        autoMode: false,
        autoInterval: null,
        turnIndex: 0,
        turnOrder: [],
        playerCharacters: [],
        enemyCharacters: [],
        allCharacters: [],
        actionQueue: [],
        battleSpeed: 1 // 전투 속도 배율
    };

    // 초기화
    function init() {
        console.log("전투 매니저 초기화 중...");
        // 초기 상태 설정
        resetBattleState();
    }

    // 전투 상태 초기화
    function resetBattleState() {
        battleState = {
            inProgress: false,
            autoMode: false,
            autoInterval: null,
            turnIndex: 0,
            turnOrder: [],
            playerCharacters: [],
            enemyCharacters: [],
            allCharacters: [],
            actionQueue: [],
            battleSpeed: 1
        };
    }

    // 전투 시작
    function startBattle(enemies) {
        // 이미 전투중이면 리턴
        if (battleState.inProgress) return;
        
        // 전투 상태 초기화
        resetBattleState();
        
        // 전투 상태 설정
        battleState.inProgress = true;
        
        // 플레이어 캐릭터 설정 (Game 모듈에서 현재 선택된 용병 가져오기)
        const gameState = Game.getState();
        battleState.playerCharacters = gameState.playerMercenaries.slice(0, 4);
        
        // 적 캐릭터 설정
        battleState.enemyCharacters = enemies;
        
        // 모든 캐릭터 목록 생성
        battleState.allCharacters = [...battleState.playerCharacters, ...battleState.enemyCharacters];
        
        // 전투 시작 메시지
        UI.clearBattleLog();
        UI.addBattleLog("전투가 시작되었습니다!");
        
        // 전투 화면 설정
        setupBattlefield();
        
        // 용맹 스탯에 따른 방어막 설정
        applyValoShield();
        
        // 턴 순서 결정
        determineActionOrder();
        
        // 첫 턴 시작
        setTimeout(nextTurn, 500);
    }

    // 전투장 설정
    function setupBattlefield() {
        // 플레이어 캐릭터 배치
        const playerFrontRow = document.querySelector('#player-side .front-row');
        const playerBackRow = document.querySelector('#player-side .back-row');
        
        // 플레이어 슬롯 초기화
        playerFrontRow.innerHTML = '';
        playerBackRow.innerHTML = '';
        
        // 플레이어 캐릭터 배치
        for (let i = 0; i < battleState.playerCharacters.length; i++) {
            const character = battleState.playerCharacters[i];
            const slotPosition = i < 2 ? 'front' : 'back';
            const rowIndex = i % 2;
            
            // 캐릭터 위치 설정
            character.position = {
                side: 'player',
                row: slotPosition,
                index: rowIndex
            };
            
            // 캐릭터 슬롯 생성
            const characterSlot = document.createElement('div');
            characterSlot.className = 'character-slot player-character';
            characterSlot.dataset.position = `${slotPosition}-${rowIndex + 1}`;
            characterSlot.dataset.id = character.id;
            
            // 체력바와 방어막 바 설정
            characterSlot.innerHTML = `
                <div class="hp-bar"><div class="hp-bar-fill" style="width: 100%;"></div></div>
                <div class="shield-bar"><div class="shield-bar-fill" style="width: 0%;"></div></div>
                <div class="character-sprite" style="background-image: url('assets/${character.class}.png');"></div>
                <div class="character-info">${character.name}</div>
            `;
            
            // 해당 열에 추가
            if (slotPosition === 'front') {
                playerFrontRow.appendChild(characterSlot);
            } else {
                playerBackRow.appendChild(characterSlot);
            }
        }
        
        // 적 캐릭터 배치
        const enemyFrontRow = document.querySelector('#enemy-side .front-row');
        const enemyBackRow = document.querySelector('#enemy-side .back-row');
        
        // 적 슬롯 초기화
        enemyFrontRow.innerHTML = '';
        enemyBackRow.innerHTML = '';
        
        // 적 캐릭터 배치
        for (let i = 0; i < battleState.enemyCharacters.length; i++) {
            const character = battleState.enemyCharacters[i];
            const slotPosition = i < 2 ? 'front' : 'back';
            const rowIndex = i % 2;
            
            // 캐릭터 위치 설정
            character.position = {
                side: 'enemy',
                row: slotPosition,
                index: rowIndex
            };
            
            // 캐릭터 슬롯 생성
            const characterSlot = document.createElement('div');
            characterSlot.className = 'character-slot enemy-character';
            characterSlot.dataset.position = `${slotPosition}-${rowIndex + 1}`;
            characterSlot.dataset.id = character.id;
            
            // 체력바와 방어막 바 설정
            characterSlot.innerHTML = `
                <div class="hp-bar"><div class="hp-bar-fill" style="width: 100%;"></div></div>
                <div class="shield-bar"><div class="shield-bar-fill" style="width: 0%;"></div></div>
                <div class="character-sprite" style="background-image: url('assets/${character.class}.png');"></div>
                <div class="character-info">${character.name}</div>
            `;
            
            // 해당 열에 추가
            if (slotPosition === 'front') {
                enemyFrontRow.appendChild(characterSlot);
            } else {
                enemyBackRow.appendChild(characterSlot);
            }
        }
        
        // UI 업데이트
        updateCharacterStats();
    }

    // 용맹 스탯에 따라 방어막 초기화
    function applyValoShield() {
        battleState.allCharacters.forEach(character => {
            // 용맹 스탯에 따라 방어막 설정 (용맹 1당 방어막 3)
            character.shield = character.valor * 3;
            
            // UI 업데이트
            updateCharacterStats();
        });
    }

    // 캐릭터 스탯 UI 업데이트
    function updateCharacterStats() {
        battleState.allCharacters.forEach(character => {
            const slot = document.querySelector(`.character-slot[data-id="${character.id}"]`);
            if (!slot) return;
            
            // 체력바 업데이트
            const hpPercentage = (character.hp / character.maxHp) * 100;
            slot.querySelector('.hp-bar-fill').style.width = `${hpPercentage}%`;
            
            // 방어막 바 업데이트
            const shieldPercentage = character.shield > 0 ? (character.shield / (character.valor * 3)) * 100 : 0;
            slot.querySelector('.shield-bar-fill').style.width = `${shieldPercentage}%`;
            
            // 캐릭터 이름과 정보 업데이트
            slot.querySelector('.character-info').textContent = `${character.name} ${character.hp}/${character.maxHp}`;
            
            // 사망 처리
            if (character.hp <= 0) {
                slot.classList.add('dead');
                slot.style.opacity = '0.5';
            } else {
                slot.classList.remove('dead');
                slot.style.opacity = '1';
            }
        });
    }

    // 턴 순서 결정
    function determineActionOrder() {
        // 살아있는 모든 캐릭터를 무게 순으로 정렬
        battleState.turnOrder = battleState.allCharacters
            .filter(char => char.hp > 0)
            .sort((a, b) => a.weight - b.weight);
            
        // 턴 순서 UI 업데이트
        updateTurnOrderUI();
    }

    // 턴 순서 UI 업데이트
    function updateTurnOrderUI() {
        const turnList = document.querySelector('#turn-order-panel .turn-list');
        turnList.innerHTML = '';
        
        battleState.turnOrder.forEach((character, index) => {
            const turnItem = document.createElement('div');
            turnItem.className = `turn-item ${character.position.side}-side`;
            
            if (index === battleState.turnIndex) {
                turnItem.classList.add('active-turn');
            }
            
            turnItem.innerHTML = `
                <div class="turn-icon"></div>
                <div class="turn-name">${character.name}</div>
                <div class="turn-weight">${character.weight}</div>
            `;
            
            turnList.appendChild(turnItem);
        });
    }

    // 다음 턴 진행
    function nextTurn() {
        // 전투가 끝났는지 확인
        if (!battleState.inProgress) return;
        
        // 승패 여부 확인
        if (checkBattleEnd()) return;
        
        // 턴 인덱스 확인 및 재설정
        if (battleState.turnIndex >= battleState.turnOrder.length) {
            battleState.turnIndex = 0;
            determineActionOrder(); // 턴 순서 재설정
        }
        
        // 현재 턴 캐릭터 가져오기
        const currentCharacter = battleState.turnOrder[battleState.turnIndex];
        
        // 현재 캐릭터의 죽음 확인
        if (currentCharacter.hp <= 0) {
            battleState.turnIndex++;
            nextTurn();
            return;
        }
        
        // 현재 턴 표시
        UI.addBattleLog(`${currentCharacter.name}의 턴!`);
        
        // 턴 순서 UI 업데이트
        updateTurnOrderUI();
        
        // 행동 선택 (AI)
        const action = determineAction(currentCharacter);
        
        // 행동 실행
        setTimeout(() => {
            executeAction(currentCharacter, action);
            
            // 턴 종료
            battleState.turnIndex++;
            setTimeout(nextTurn, 1000 / battleState.battleSpeed);
        }, 500 / battleState.battleSpeed);
    }

    // 행동 결정 (AI)
    function determineAction(character) {
        // 기본 행동 (평타)
        let action = {
            type: 'attack',
            skill: null,
            targets: []
        };
        
        // 플레이어 캐릭터인지 적 캐릭터인지에 따라 타겟 선택
        const isPlayerCharacter = character.position.side === 'player';
        const possibleTargets = isPlayerCharacter ? battleState.enemyCharacters : battleState.playerCharacters;
        
        // 살아있는 대상만 선택
        const aliveTargets = possibleTargets.filter(target => target.hp > 0);
        
        // 앞줄 대상만 선택 (앞줄이 없으면 뒷줄)
        const frontRowTargets = aliveTargets.filter(target => target.position.row === 'front');
        const targetPool = frontRowTargets.length > 0 ? frontRowTargets : aliveTargets;
        
        // 타겟이 없으면 스킵
        if (targetPool.length === 0) {
            return { type: 'skip', skill: null, targets: [] };
        }
        
        // 랜덤으로 하나 선택
        const randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
        action.targets.push(randomTarget);
        
        // 스킬 사용 여부 결정
        if (character.skills && character.skills.length > 0) {
            // 첫 번째 스킬(사용 확률 60%)
            if (Math.random() < 0.6 && character.skills[0]) {
                action.type = 'skill';
                action.skill = character.skills[0];
                
                // 스킬 타입에 따라 타겟 선택
                action.targets = determineSkillTargets(character, character.skills[0], isPlayerCharacter);
                return action;
            }
            
            // 두 번째 스킬(사용 확률 40%)
            if (Math.random() < 0.4 && character.skills.length > 1 && character.skills[1]) {
                action.type = 'skill';
                action.skill = character.skills[1];
                
                // 스킬 타입에 따라 타겟 선택
                action.targets = determineSkillTargets(character, character.skills[1], isPlayerCharacter);
                return action;
            }
            
            // 세 번째 스킬(사용 확률 20%)
            if (Math.random() < 0.2 && character.skills.length > 2 && character.skills[2]) {
                action.type = 'skill';
                action.skill = character.skills[2];
                
                // 스킬 타입에 따라 타겟 선택
                action.targets = determineSkillTargets(character, character.skills[2], isPlayerCharacter);
                return action;
            }
        }
        
        return action;
    }

    // 스킬에 따른 타겟 결정
    function determineSkillTargets(character, skill, isPlayerCharacter) {
        const possibleTargets = isPlayerCharacter ? battleState.enemyCharacters : battleState.playerCharacters;
        
        // 살아있는 대상만 선택
        const aliveTargets = possibleTargets.filter(target => target.hp > 0);
        
        // 스킬 타입에 따라 타겟 선택
        switch (skill.type) {
            case 'individual': // 개별 (앞열 랜덤 1명)
                const frontRowTargets = aliveTargets.filter(target => target.position.row === 'front');
                if (frontRowTargets.length > 0) {
                    return [frontRowTargets[Math.floor(Math.random() * frontRowTargets.length)]];
                } else {
                    return [aliveTargets[Math.floor(Math.random() * aliveTargets.length)]];
                }
                
            case 'all': // 전체 (앞열 전체)
                const frontRow = aliveTargets.filter(target => target.position.row === 'front');
                if (frontRow.length > 0) {
                    return frontRow;
                } else {
                    return aliveTargets;
                }
                
            case 'penetrate': // 관통 (앞열 랜덤 1명 + 뒷열)
                const result = [];
                const frontTargets = aliveTargets.filter(target => target.position.row === 'front');
                
                if (frontTargets.length > 0) {
                    const frontTarget = frontTargets[Math.floor(Math.random() * frontTargets.length)];
                    result.push(frontTarget);
                    
                    // 뒷열 타겟 추가
                    const backTargets = aliveTargets.filter(target => target.position.row === 'back');
                    if (backTargets.length > 0) {
                        result.push(backTargets[Math.floor(Math.random() * backTargets.length)]);
                    }
                } else {
                    // 앞열이 없으면 뒷열 중 하나
                    result.push(aliveTargets[Math.floor(Math.random() * aliveTargets.length)]);
                }
                
                return result;
                
            case 'snipe': // 저격 (뒷열 랜덤 1명)
                const backRowTargets = aliveTargets.filter(target => target.position.row === 'back');
                if (backRowTargets.length > 0) {
                    return [backRowTargets[Math.floor(Math.random() * backRowTargets.length)]];
                } else {
                    return [aliveTargets[Math.floor(Math.random() * aliveTargets.length)]];
                }
                
            default:
                // 기본 타겟 (앞열 중 하나)
                const defaultFrontTargets = aliveTargets.filter(target => target.position.row === 'front');
                if (defaultFrontTargets.length > 0) {
                    return [defaultFrontTargets[Math.floor(Math.random() * defaultFrontTargets.length)]];
                } else {
                    return [aliveTargets[Math.floor(Math.random() * aliveTargets.length)]];
                }
        }
    }

    // 행동 실행
    function executeAction(character, action) {
        // 액션이 스킵이면 아무것도 하지 않음
        if (action.type === 'skip') {
            UI.addBattleLog(`${character.name}(이)가 행동을 건너뜁니다.`);
            return;
        }
        
        // 타겟이 없으면 아무것도 하지 않음
        if (action.targets.length === 0) {
            UI.addBattleLog(`${character.name}(이)가 대상을 찾지 못했습니다.`);
            return;
        }
        
        // 스킬 사용
        if (action.type === 'skill' && action.skill) {
            executeSkill(character, action.skill, action.targets);
        } 
        // 기본 공격
        else {
            executeAttack(character, action.targets[0]);
        }
        
        // 캐릭터 상태 업데이트
        updateCharacterStats();
    }

    // 기본 공격 실행
    function executeAttack(attacker, target) {
        // 공격 애니메이션
        const attackerSlot = document.querySelector(`.character-slot[data-id="${attacker.id}"]`);
        attackerSlot.classList.add('attack-animation');
        setTimeout(() => attackerSlot.classList.remove('attack-animation'), 400);
        
        // 데미지 계산 (공격력 기반)
        let damage = calculateDamage(attacker, target);
        
        // 방어막 적용
        damage = applyDamage(target, damage);
        
        // 공격 로그
        UI.addBattleLog(`${attacker.name}(이)가 ${target.name}에게 <strong>${damage}</strong> 데미지를 입혔습니다.`);
        
        // 데미지 텍스트 애니메이션
        showDamageText(target, damage);
    }

    // 스킬 실행
    function executeSkill(character, skill, targets) {
        // 스킬 사용 로그
        UI.addBattleLog(`<span class="skill">${character.name}(이)가 <strong>${skill.name}</strong> 스킬을 사용했습니다.</span>`);
        
        // 스킬 애니메이션
        const characterSlot = document.querySelector(`.character-slot[data-id="${character.id}"]`);
        characterSlot.classList.add('skill-animation');
        setTimeout(() => characterSlot.classList.remove('skill-animation'), 600);
        
        // 스킬 효과 적용
        switch (skill.type) {
            case 'individual': // 개별 공격
                if (targets.length > 0) {
                    const target = targets[0];
                    let damage = calculateDamage(character, target, skill.multiplier || 1.5);
                    damage = applyDamage(target, damage);
                    
                    UI.addBattleLog(`${character.name}(이)가 ${target.name}에게 <strong>${damage}</strong> 데미지를 입혔습니다.`);
                    showDamageText(target, damage);
                }
                break;
                
            case 'all': // 전체 공격
                targets.forEach(target => {
                    let damage = calculateDamage(character, target, skill.multiplier || 1.2);
                    damage = applyDamage(target, damage);
                    
                    UI.addBattleLog(`${character.name}(이)가 ${target.name}에게 <strong>${damage}</strong> 데미지를 입혔습니다.`);
                    showDamageText(target, damage);
                });
                break;
                
            case 'penetrate': // 관통 공격
                if (targets.length > 0) {
                    const frontTarget = targets[0];
                    let frontDamage = calculateDamage(character, frontTarget, skill.multiplier || 1.3);
                    frontDamage = applyDamage(frontTarget, frontDamage);
                    
                    UI.addBattleLog(`${character.name}(이)가 ${frontTarget.name}에게 <strong>${frontDamage}</strong> 데미지를 입혔습니다.`);
                    showDamageText(frontTarget, frontDamage);
                    
                    // 뒷열 타겟에게 50% 데미지
                    if (targets.length > 1) {
                        const backTarget = targets[1];
                        let backDamage = calculateDamage(character, backTarget, (skill.multiplier || 1.3) * 0.5);
                        backDamage = applyDamage(backTarget, backDamage);
                        
                        UI.addBattleLog(`관통 효과로 ${backTarget.name}에게 <strong>${backDamage}</strong> 데미지를 입혔습니다.`);
                        showDamageText(backTarget, backDamage);
                    }
                }
                break;
                
            case 'snipe': // 저격 (뒷열 타겟)
                if (targets.length > 0) {
                    const target = targets[0];
                    let damage = calculateDamage(character, target, skill.multiplier || 1.6);
                    damage = applyDamage(target, damage);
                    
                    UI.addBattleLog(`${character.name}(이)가 ${target.name}에게 <strong>${damage}</strong> 데미지를 입혔습니다.`);
                    showDamageText(target, damage);
                }
                break;
                
            case 'heal': // 아군 치유
                const healTargets = character.position.side === 'player' 
                    ? battleState.playerCharacters
                    : battleState.enemyCharacters;
                
                // 가장 체력이 낮은 아군 선택
                const lowestHpTarget = healTargets
                    .filter(char => char.hp > 0)
                    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
                
                if (lowestHpTarget) {
                    const healAmount = Math.floor(character.int * (skill.multiplier || 1.5));
                    lowestHpTarget.hp = Math.min(lowestHpTarget.maxHp, lowestHpTarget.hp + healAmount);
                    
                    UI.addBattleLog(`<span class="heal">${character.name}(이)가 ${lowestHpTarget.name}의 체력을 <strong>${healAmount}</strong> 회복시켰습니다.</span>`);
                    showHealText(lowestHpTarget, healAmount);
                }
                break;
                
            case 'shield': // 방어막 생성
                const shieldTargets = character.position.side === 'player'
                    ? battleState.playerCharacters
                    : battleState.enemyCharacters;
                
                // 전방 아군 또는 자신 선택
                const frontShieldTargets = shieldTargets
                    .filter(char => char.hp > 0 && char.position.row === 'front');
                
                const shieldTarget = frontShieldTargets.length > 0
                    ? frontShieldTargets[Math.floor(Math.random() * frontShieldTargets.length)]
                    : character;
                
                const shieldAmount = Math.floor(character.valor * (skill.multiplier || 1.2));
                shieldTarget.shield += shieldAmount;
                
                UI.addBattleLog(`<span class="shield">${character.name}(이)가 ${shieldTarget.name}에게 <strong>${shieldAmount}</strong> 방어막을 생성했습니다.</span>`);
                showShieldText(shieldTarget, shieldAmount);
                break;
                
            case 'buff': // 버프
                // 버프 효과 적용 (향후 확장)
                break;
                
            case 'debuff': // 디버프
                // 디버프 효과 적용 (향후 확장)
                break;
        }
    }

    // 데미지 계산
    function calculateDamage(attacker, target, multiplier = 1) {
        // 공격자의 공격력 계산
        let attackPower;
        if (attacker.class === 'warrior' || attacker.class === 'knight') {
            // 물리 공격 캐릭터는 힘 스탯 기반
            attackPower = attacker.atk + attacker.str * 2;
        } else {
            // 마법 공격 캐릭터는 지력 스탯 기반
            attackPower = attacker.atk + attacker.int * 2;
        }
        
        // 방어막에 따른 추가 데미지
        const shieldBonus = attacker.shield > 0 ? 1 + (attacker.shield / (attacker.valor * 3)) * 0.5 : 1;
        attackPower *= shieldBonus;
        
        // 데미지 계산
        let damage = attackPower * multiplier;
        
        // 방어력 적용
        damage = Math.max(1, damage - target.def * 0.5);
        
        // 랜덤 요소 추가 (90~110%)
        const randomFactor = 0.9 + Math.random() * 0.2;
        damage = Math.floor(damage * randomFactor);
        
        return damage;
    }

    // 데미지 적용
    function applyDamage(target, damage) {
        // 방어막이 있으면 먼저 방어막 소모
        if (target.shield > 0) {
            if (target.shield >= damage) {
                target.shield -= damage;
                return damage; // 방어막에 모두 흡수됨
            } else {
                const remainingDamage = damage - target.shield;
                target.shield = 0;
                target.hp -= remainingDamage;
                return damage; // 실제 데미지
            }
        } else {
            // 방어막이 없으면 HP에서 직접 차감
            target.hp -= damage;
            return damage;
        }
        
        // HP가 0 미만이면 0으로 설정
        if (target.hp < 0) target.hp = 0;
    }

    // 데미지 텍스트 표시
    function showDamageText(target, damage) {
        const targetSlot = document.querySelector(`.character-slot[data-id="${target.id}"]`);
        if (!targetSlot) return;
        
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.style.color = '#e74c3c';
        damageText.textContent = `-${damage}`;
        
        // 위치 설정
        damageText.style.left = `${20 + Math.random() * 40}px`;
        damageText.style.top = `${20 + Math.random() * 40}px`;
        
        targetSlot.appendChild(damageText);
        
        // 애니메이션 후 제거
        setTimeout(() => {
            damageText.remove();
        }, 1000);
    }

    // 회복 텍스트 표시
    function showHealText(target, amount) {
        const targetSlot = document.querySelector(`.character-slot[data-id="${target.id}"]`);
        if (!targetSlot) return;
        
        const healText = document.createElement('div');
        healText.className = 'damage-text';
        healText.style.color = '#2ecc71';
        healText.textContent = `+${amount}`;
        
        // 위치 설정
        healText.style.left = `${20 + Math.random() * 40}px`;
        healText.style.top = `${20 + Math.random() * 40}px`;
        
        targetSlot.appendChild(healText);
        
        // 애니메이션 후 제거
        setTimeout(() => {
            healText.remove();
        }, 1000);
    }

    // 방어막 텍스트 표시
    function showShieldText(target, amount) {
        const targetSlot = document.querySelector(`.character-slot[data-id="${target.id}"]`);
        if (!targetSlot) return;
        
        const shieldText = document.createElement('div');
        shieldText.className = 'damage-text';
        shieldText.style.color = '#3498db';
        shieldText.textContent = `+${amount} 방어`;
        
        // 위치 설정
        shieldText.style.left = `${20 + Math.random() * 40}px`;
        shieldText.style.top = `${20 + Math.random() * 40}px`;
        
        targetSlot.appendChild(shieldText);
        
        // 애니메이션 후 제거
        setTimeout(() => {
            shieldText.remove();
        }, 1000);
    }

    // 전투 종료 확인
    function checkBattleEnd() {
        // 플레이어 캐릭터들의 HP 확인
        const alivePlayerCharacters = battleState.playerCharacters.filter(char => char.hp > 0);
        
        // 적 캐릭터들의 HP 확인
        const aliveEnemyCharacters = battleState.enemyCharacters.filter(char => char.hp > 0);
        
        // 승패 결정
        if (alivePlayerCharacters.length === 0) {
            // 플레이어 패배
            endBattle(false);
            return true;
        } else if (aliveEnemyCharacters.length === 0) {
            // 플레이어 승리
            endBattle(true);
            return true;
        }
        
        return false;
    }

    // 자동 전투 시작
    function startAutoBattle() {
        if (!battleState.inProgress) {
            startBattle(Game.generateEnemies());
        }
        
        battleState.autoMode = true;
        
        // 전투 속도 증가
        battleState.battleSpeed = 2;
    }

    // 자동 전투 중지
    function stopAutoBattle() {
        battleState.autoMode = false;
        
        // 전투 속도 복원
        battleState.battleSpeed = 1;
    }

    // 전투 건너뛰기 (즉시 결과 계산)
    function skipBattle() {
        if (!battleState.inProgress) return;
        
        // 전투 속도 최대로 증가
        battleState.battleSpeed = 10;
        
        // 전투 로그 감추기
        document.getElementById('battle-log').style.opacity = '0.5';
        
        // 모든 턴을 빠르게 진행하여 결과만 보여줌
        // (실제로는 전투를 그대로 진행하되 속도만 빠르게)
    }

    // 전투 종료
    function endBattle(isVictory) {
        if (!battleState.inProgress) return;
        
        battleState.inProgress = false;
        battleState.autoMode = false;
        
        if (battleState.autoInterval) {
            clearInterval(battleState.autoInterval);
            battleState.autoInterval = null;
        }
        
        // 전투 결과 표시
        if (isVictory) {
            UI.addBattleLog("<strong>전투에서 승리했습니다!</strong>");
            
            // 보상 처리
            const rewards = calculateRewards();
            
            // 보상 UI 표시
            UI.showRewards(rewards);
            
            // 스테이지 진행
            Game.goToNextStage();
        } else {
            UI.addBattleLog("<strong>전투에서 패배했습니다...</strong>");
        }
        
        // UI 업데이트
        UI.updateBattleUI();
    }

    // 보상 계산
    function calculateRewards() {
        const gameState = Game.getState();
        const stageLevel = gameState.currentStage;
        
        const gold = Math.floor(50 * stageLevel * (1 + Math.random() * 0.5));
        const exp = Math.floor(20 * stageLevel * (1 + Math.random() * 0.3));
        
        // TODO: 아이템 드롭 구현
        const items = [];
        
        return {
            gold,
            exp,
            items
        };
    }

    // 공개 메서드
    return {
        init,
        startBattle,
        nextTurn,
        executeAction,
        checkBattleEnd,
        startAutoBattle,
        stopAutoBattle,
        skipBattle,
        endBattle
    };
})();