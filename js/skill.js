// 스킬 관리 모듈
export const SkillManager = (() => {
    // 스킬 타입 정의
    const skillTypes = {
        individual: '개별',     // 앞열 랜덤 1명 공격
        all: '전체',           // 앞열 전체 공격
        penetrate: '관통',     // 앞열 랜덤 1명 + 뒷열 랜덤 1명 공격
        snipe: '저격',         // 뒷열 랜덤 1명 공격
        heal: '치유',           // 아군 치유
        shield: '방어막',       // 방어막 생성
        buff: '버프',           // 버프 효과
        debuff: '디버프',       // 디버프 효과
        passive: '패시브'       // 패시브 효과
    };
    
    // 스킬 풀 (클래스별 스킬)
    const skillPool = {
        // 전사 스킬
        warrior: [
            {
                id: 'warrior_power_strike',
                name: '파워 스트라이크',
                type: 'individual',
                multiplier: 1.8,
                description: '강력한 일격으로 단일 대상에게 180% 데미지를 입힙니다.'
            },
            {
                id: 'warrior_whirlwind',
                name: '회전 베기',
                type: 'all',
                multiplier: 1.2,
                description: '회전하며 전방의 모든 적에게 120% 데미지를 입힙니다.'
            },
            {
                id: 'warrior_charge',
                name: '돌진',
                type: 'penetrate',
                multiplier: 1.5,
                description: '적을 돌진하여 앞열과 뒷열에 데미지를 입힙니다. 앞열 150%, 뒷열 75%'
            },
            {
                id: 'warrior_battlecry',
                name: '전투의 함성',
                type: 'buff',
                description: '아군의 공격력이 15% 상승합니다.'
            },
            {
                id: 'warrior_berserker',
                name: '버서커 모드',
                type: 'passive',
                description: '체력이 30% 이하일 때 공격력이 30% 증가합니다.'
            }
        ],
        
        // 기사 스킬
        knight: [
            {
                id: 'knight_shield_bash',
                name: '쉴드 배쉬',
                type: 'individual',
                multiplier: 1.5,
                description: '방패로 적을 강타하여 150% 데미지를 입히고 1턴간 기절시킵니다.'
            },
            {
                id: 'knight_shield_throw',
                name: '방패 던지기',
                type: 'penetrate',
                multiplier: 1.2,
                description: '방패를 던져 앞열과 뒷열에 데미지를 입힙니다. 앞열 120%, 뒷열 60%'
            },
            {
                id: 'knight_protective_shield',
                name: '수호의 방패',
                type: 'shield',
                multiplier: 1.5,
                description: '방어막을 형성합니다. (용맹 * 1.5)'
            },
            {
                id: 'knight_taunt',
                name: '도발',
                type: 'debuff',
                description: '적의 공격을 자신에게 유도합니다.'
            },
            {
                id: 'knight_stone_skin',
                name: '스톤 스킨',
                type: 'passive',
                description: '방어력이 15% 증가합니다.'
            }
        ],
        
        // 마법사 스킬
        mage: [
            {
                id: 'mage_fireball',
                name: '파이어볼',
                type: 'individual',
                multiplier: 2.0,
                description: '화염구를 날려 200% 데미지를 입힙니다.'
            },
            {
                id: 'mage_fire_wall',
                name: '파이어 월',
                type: 'all',
                multiplier: 1.4,
                description: '화염의 벽을 생성하여 앞열 전체에 140% 데미지를 입힙니다.'
            },
            {
                id: 'mage_lightning_bolt',
                name: '라이트닝 볼트',
                type: 'snipe',
                multiplier: 1.8,
                description: '번개 화살로 후열의 적을 공격하여 180% 데미지를 입힙니다.'
            },
            {
                id: 'mage_mana_shield',
                name: '마나 쉴드',
                type: 'shield',
                multiplier: 1.0,
                description: '마법 방어막을 형성합니다. (용맹 * 1.0)'
            },
            {
                id: 'mage_mind_will',
                name: '마인드 윌',
                type: 'passive',
                description: '지력이 15% 증가합니다.'
            }
        ],
        
        // 힐러 스킬
        healer: [
            {
                id: 'healer_heal',
                name: '힐',
                type: 'heal',
                multiplier: 1.8,
                description: '아군 한 명의 체력을 회복합니다. (지력 * 1.8)'
            },
            {
                id: 'healer_group_heal',
                name: '그룹 힐',
                type: 'heal',
                multiplier: 1.0,
                description: '모든 아군의 체력을 회복합니다. (지력 * 1.0)'
            },
            {
                id: 'healer_divine_light',
                name: '디바인 라이트',
                type: 'individual',
                multiplier: 1.5,
                description: '신성한 빛으로 적에게 150% 데미지를 입힙니다.'
            },
            {
                id: 'healer_blessing',
                name: '블레싱',
                type: 'buff',
                description: '아군의 방어력이 20% 증가합니다.'
            },
            {
                id: 'healer_vitality',
                name: '생명력 향상',
                type: 'passive',
                description: '최대 체력이 15% 증가합니다.'
            }
        ],
        
        // 궁수 스킬
        archer: [
            {
                id: 'archer_precise_shot',
                name: '정밀 사격',
                type: 'individual',
                multiplier: 1.7,
                description: '정확한 공격으로 170% 데미지를 입힙니다.'
            },
            {
                id: 'archer_sniper_shot',
                name: '저격 사격',
                type: 'snipe',
                multiplier: 2.0,
                description: '후열의 적을 저격하여 200% 데미지를 입힙니다.'
            },
            {
                id: 'archer_multi_shot',
                name: '다중 사격',
                type: 'all',
                multiplier: 1.2,
                description: '여러 발의 화살을 발사하여 앞열 전체에 120% 데미지를 입힙니다.'
            },
            {
                id: 'archer_piercing_shot',
                name: '살상 사격',
                type: 'penetrate',
                multiplier: 1.4,
                description: '관통 화살을 발사하여 앞열과 뒷열에 데미지를 입힙니다. 앞열 140%, 뒷열 70%'
            },
            {
                id: 'archer_agility',
                name: '날렵함',
                type: 'passive',
                description: '회피율이 10% 증가합니다.'
            }
        ]
    };
    
    // 특정 클래스의 스킬 목록 가져오기
    function getSkillsByClass(className) {
        return skillPool[className] || [];
    }
    
    // 특정 ID의 스킬 가져오기
    function getSkillById(skillId) {
        for (const classSkills of Object.values(skillPool)) {
            const skill = classSkills.find(skill => skill.id === skillId);
            if (skill) return skill;
        }
        return null;
    }
    
    // 랜덤 스킬 생성
    function generateRandomSkills(className, count = 3) {
        const classSkills = getSkillsByClass(className);
        
        if (classSkills.length === 0) {
            return [];
        }
        
        // 스킬 복사 및 셔플
        const shuffledSkills = [...classSkills].sort(() => Math.random() - 0.5);
        
        // 요청된 수만큼 스킬 선택
        return shuffledSkills.slice(0, Math.min(count, shuffledSkills.length));
    }
    
    // 스킬 효과 적용
    function applySkillEffect(caster, targets, skill) {
        if (!caster || !targets || !skill) {
            return [];
        }
        
        const results = [];
        
        switch (skill.type) {
            case 'individual':
                // 단일 대상 공격
                if (targets.length > 0) {
                    const target = targets[0];
                    const damage = calculateDamage(caster, target, skill.multiplier || 1.5);
                    results.push({
                        target: target,
                        effect: 'damage',
                        amount: damage
                    });
                }
                break;
                
            case 'all':
                // 다중 대상 공격
                targets.forEach(target => {
                    const damage = calculateDamage(caster, target, skill.multiplier || 1.2);
                    results.push({
                        target: target,
                        effect: 'damage',
                        amount: damage
                    });
                });
                break;
                
            case 'penetrate':
                // 관통 공격 (앞열 + 뒷열)
                if (targets.length > 0) {
                    // 앞열 대상
                    const frontTarget = targets[0];
                    const frontDamage = calculateDamage(caster, frontTarget, skill.multiplier || 1.3);
                    results.push({
                        target: frontTarget,
                        effect: 'damage',
                        amount: frontDamage
                    });
                    
                    // 뒷열 대상 (있을 경우)
                    if (targets.length > 1) {
                        const backTarget = targets[1];
                        const backDamage = calculateDamage(caster, backTarget, (skill.multiplier || 1.3) * 0.5);
                        results.push({
                            target: backTarget,
                            effect: 'damage',
                            amount: backDamage
                        });
                    }
                }
                break;
                
            case 'snipe':
                // 저격 (뒷열 대상)
                if (targets.length > 0) {
                    const target = targets[0];
                    const damage = calculateDamage(caster, target, skill.multiplier || 1.6);
                    results.push({
                        target: target,
                        effect: 'damage',
                        amount: damage
                    });
                }
                break;
                
            case 'heal':
                // 아군 치유
                targets.forEach(target => {
                    const healAmount = Math.floor(caster.int * (skill.multiplier || 1.5));
                    results.push({
                        target: target,
                        effect: 'heal',
                        amount: healAmount
                    });
                });
                break;
                
            case 'shield':
                // 방어막 생성
                targets.forEach(target => {
                    const shieldAmount = Math.floor(caster.valor * (skill.multiplier || 1.2));
                    results.push({
                        target: target,
                        effect: 'shield',
                        amount: shieldAmount
                    });
                });
                break;
                
            case 'buff':
                // 버프 효과 (향후 구현)
                break;
                
            case 'debuff':
                // 디버프 효과 (향후 구현)
                break;
        }
        
        return results;
    }
    
    // 기본 데미지 계산
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
    
    // 공개 메서드
    return {
        getSkillsByClass,
        getSkillById,
        generateRandomSkills,
        applySkillEffect,
        skillTypes
    };
})();

// 스킬 배열에서 확률에 따라 스킬을 선택
export function getRandomSkill(skills = []) {
    if (!skills || skills.length === 0) return null;

    const weights = [0.6, 0.4, 0.2];
    const available = skills.slice(0, 3);
    const total = weights.slice(0, available.length).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 0; i < available.length; i++) {
        const w = weights[i];
        if (r < w) {
            const skill = { ...available[i] };
            if (skill.type === 'heal') {
                skill.amount = Math.floor(10 * (skill.multiplier || 1));
            } else {
                skill.damage = Math.floor(10 * (skill.multiplier || 1));
            }
            return skill;
        }
        r -= w;
    }
    return null;
}
