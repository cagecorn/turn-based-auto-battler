// 캐릭터 관리 모듈
const CharacterFactory = (() => {
    // 캐릭터 ID 생성 카운터
    let idCounter = 1;
    
    // 클래스별 기본 스탯 정의
    const classBaseStats = {
        warrior: {
            hp: 120,
            atk: 15,
            def: 10,
            str: 12,
            int: 5,
            valor: 8,
            weight: 20
        },
        knight: {
            hp: 150,
            atk: 12,
            def: 15,
            str: 10,
            int: 6,
            valor: 10,
            weight: 25
        },
        mage: {
            hp: 80,
            atk: 18,
            def: 5,
            str: 5,
            int: 15,
            valor: 6,
            weight: 15
        },
        healer: {
            hp: 90,
            atk: 10,
            def: 8,
            str: 6,
            int: 12,
            valor: 10,
            weight: 18
        },
        archer: {
            hp: 85,
            atk: 16,
            def: 6,
            str: 8,
            int: 10,
            valor: 7,
            weight: 12
        },
        goblin: {
            hp: 60,
            atk: 8,
            def: 5,
            str: 7,
            int: 4,
            valor: 3,
            weight: 10
        },
        orc: {
            hp: 100,
            atk: 12,
            def: 8,
            str: 10,
            int: 3,
            valor: 6,
            weight: 22
        },
        shaman: {
            hp: 65,
            atk: 10,
            def: 4,
            str: 4,
            int: 12,
            valor: 8,
            weight: 15
        }
    };
    
    // 클래스별 스킬 풀
    const classSkillPool = {
        warrior: [
            {
                name: '파워 스트라이크',
                type: 'individual',
                multiplier: 1.8,
                description: '강력한 일격으로 단일 대상에게 180% 데미지를 입힙니다.'
            },
            {
                name: '회전 베기',
                type: 'all',
                multiplier: 1.2,
                description: '회전하며 전방의 모든 적에게 120% 데미지를 입힙니다.'
            },
            {
                name: '돌진',
                type: 'penetrate',
                multiplier: 1.5,
                description: '적을 돌진하여 앞열과 뒷열에 데미지를 입힙니다. 앞열 150%, 뒷열 75%'
            },
            {
                name: '전투의 함성',
                type: 'buff',
                description: '아군의 공격력이 15% 상승합니다.'
            },
            {
                name: '버서커 모드',
                type: 'passive',
                description: '체력이 30% 이하일 때 공격력이 30% 증가합니다.'
            }
        ],
        knight: [
            {
                name: '쉴드 배쉬',
                type: 'individual',
                multiplier: 1.5,
                description: '방패로 적을 강타하여 150% 데미지를 입히고 1턴간 기절시킵니다.'
            },
            {
                name: '방패 던지기',
                type: 'penetrate',
                multiplier: 1.2,
                description: '방패를 던져 앞열과 뒷열에 데미지를 입힙니다. 앞열 120%, 뒷열 60%'
            },
            {
                name: '수호의 방패',
                type: 'shield',
                multiplier: 1.5,
                description: '방어막을 형성합니다. (용맹 * 1.5)'
            },
            {
                name: '도발',
                type: 'debuff',
                description: '적의 공격을 자신에게 유도합니다.'
            },
            {
                name: '스톤 스킨',
                type: 'passive',
                description: '방어력이 15% 증가합니다.'
            }
        ],
        mage: [
            {
                name: '파이어볼',
                type: 'individual',
                multiplier: 2.0,
                description: '화염구를 날려 200% 데미지를 입힙니다.'
            },
            {
                name: '파이어 월',
                type: 'all',
                multiplier: 1.4,
                description: '화염의 벽을 생성하여 앞열 전체에 140% 데미지를 입힙니다.'
            },
            {
                name: '라이트닝 볼트',
                type: 'snipe',
                multiplier: 1.8,
                description: '번개 화살로 후열의 적을 공격하여 180% 데미지를 입힙니다.'
            },
            {
                name: '마나 쉴드',
                type: 'shield',
                multiplier: 1.0,
                description: '마법 방어막을 형성합니다. (용맹 * 1.0)'
            },
            {
                name: '마인드 윌',
                type: 'passive',
                description: '지력이 15% 증가합니다.'
            }
        ],
        healer: [
            {
                name: '힐',
                type: 'heal',
                multiplier: 1.8,
                description: '아군 한 명의 체력을 회복합니다. (지력 * 1.8)'
            },
            {
                name: '그룹 힐',
                type: 'heal',
                multiplier: 1.0,
                description: '모든 아군의 체력을 회복합니다. (지력 * 1.0)'
            },
            {
                name: '디바인 라이트',
                type: 'individual',
                multiplier: 1.5,
                description: '신성한 빛으로 적에게 150% 데미지를 입힙니다.'
            },
            {
                name: '블레싱',
                type: 'buff',
                description: '아군의 방어력이 20% 증가합니다.'
            },
            {
                name: '생명력 향상',
                type: 'passive',
                description: '최대 체력이 15% 증가합니다.'
            }
        ],
        archer: [
            {
                name: '정밀 사격',
                type: 'individual',
                multiplier: 1.7,
                description: '정확한 공격으로 170% 데미지를 입힙니다.'
            },
            {
                name: '저격 사격',
                type: 'snipe',
                multiplier: 2.0,
                description: '후열의 적을 저격하여 200% 데미지를 입힙니다.'
            },
            {
                name: '다중 사격',
                type: 'all',
                multiplier: 1.2,
                description: '여러 발의 화살을 발사하여 앞열 전체에 120% 데미지를 입힙니다.'
            },
            {
                name: '살상 사격',
                type: 'penetrate',
                multiplier: 1.4,
                description: '관통 화살을 발사하여 앞열과 뒷열에 데미지를 입힙니다. 앞열 140%, 뒷열 70%'
            },
            {
                name: '날렵함',
                type: 'passive',
                description: '회피율이 10% 증가합니다.'
            }
        ],
        goblin: [
            {
                name: '날카로운 공격',
                type: 'individual',
                multiplier: 1.4,
                description: '예리한 무기로 140% 데미지를 입힙니다.'
            },
            {
                name: '마구 휘두르기',
                type: 'all',
                multiplier: 1.0,
                description: '무기를 마구 휘둘러 앞열 전체에 100% 데미지를 입힙니다.'
            },
            {
                name: '약탈',
                type: 'debuff',
                description: '대상의 방어력을 10% 감소시킵니다.'
            }
        ],
        orc: [
            {
                name: '분쇄 강타',
                type: 'individual',
                multiplier: 1.6,
                description: '강력한 무기로 160% 데미지를 입힙니다.'
            },
            {
                name: '울부짖음',
                type: 'buff',
                description: '모든 아군의 공격력을 10% 증가시킵니다.'
            },
            {
                name: '야만의 힘',
                type: 'passive',
                description: '힘이 10% 증가합니다.'
            }
        ],
        shaman: [
            {
                name: '저주의 화살',
                type: 'individual',
                multiplier: 1.5,
                description: '저주받은 화살로 150% 데미지를 입힙니다.'
            },
            {
                name: '치유 주문',
                type: 'heal',
                multiplier: 1.5,
                description: '아군 한 명의 체력을 회복합니다. (지력 * 1.5)'
            },
            {
                name: '약화 주문',
                type: 'debuff',
                description: '대상의 공격력을 15% 감소시킵니다.'
            }
        ]
    };

    // 용병 생성 함수
    function createMercenary(className, name, level) {
        if (!classBaseStats[className]) {
            throw new Error(`알 수 없는 클래스: ${className}`);
        }
        
        // 기본 스탯 가져오기
        const baseStats = classBaseStats[className];
        
        // 레벨에 따른 스탯 보정
        const levelMultiplier = 1 + (level - 1) * 0.1; // 레벨당 10% 증가
        
        // 스킬 랜덤 선택 (클래스 기반)
        const skills = generateSkills(className);
        
        // 용병 객체 생성
        const mercenary = {
            id: `merc_${idCounter++}`,
            name: name,
            class: className,
            level: level,
            
            // 스탯 설정 (레벨에 따른 스케일링 적용)
            maxHp: Math.floor(baseStats.hp * levelMultiplier),
            hp: Math.floor(baseStats.hp * levelMultiplier),
            atk: Math.floor(baseStats.atk * levelMultiplier),
            def: Math.floor(baseStats.def * levelMultiplier),
            str: Math.floor(baseStats.str * levelMultiplier),
            int: Math.floor(baseStats.int * levelMultiplier),
            valor: Math.floor(baseStats.valor * levelMultiplier),
            weight: Math.floor(baseStats.weight * levelMultiplier),
            
            // 전투용 상태
            shield: 0,
            position: null,
            
            // 스킬
            skills: skills,
            
            // 장비
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            }
        };
        
        return mercenary;
    }
    
    // 적 생성 함수
    function createEnemy(className, name, level) {
        if (!classBaseStats[className]) {
            throw new Error(`알 수 없는 클래스: ${className}`);
        }
        
        // 기본 스탯 가져오기
        const baseStats = classBaseStats[className];
        
        // 레벨에 따른 스탯 보정
        const levelMultiplier = 1 + (level - 1) * 0.1; // 레벨당 10% 증가
        
        // 스킬 랜덤 선택 (클래스 기반)
        const skills = generateEnemySkills(className);
        
        // 적 객체 생성
        const enemy = {
            id: `enemy_${idCounter++}`,
            name: name,
            class: className,
            level: level,
            
            // 스탯 설정 (레벨에 따른 스케일링 적용)
            maxHp: Math.floor(baseStats.hp * levelMultiplier),
            hp: Math.floor(baseStats.hp * levelMultiplier),
            atk: Math.floor(baseStats.atk * levelMultiplier),
            def: Math.floor(baseStats.def * levelMultiplier),
            str: Math.floor(baseStats.str * levelMultiplier),
            int: Math.floor(baseStats.int * levelMultiplier),
            valor: Math.floor(baseStats.valor * levelMultiplier),
            weight: Math.floor(baseStats.weight * levelMultiplier),
            
            // 전투용 상태
            shield: 0,
            position: null,
            
            // 스킬
            skills: skills
        };
        
        return enemy;
    }
    
    // 용병 스킬 생성 함수
    function generateSkills(className) {
        const skillPool = classSkillPool[className] || [];
        if (skillPool.length === 0) {
            return [];
        }
        
        // 스킬 풀을 복사하여 셔플
        const shuffledSkills = [...skillPool].sort(() => Math.random() - 0.5);
        
        // 최대 3개의 스킬 선택
        const selectedSkills = shuffledSkills.slice(0, Math.min(3, shuffledSkills.length));
        
        return selectedSkills;
    }
    
    // 적 스킬 생성 함수
    function generateEnemySkills(className) {
        const skillPool = classSkillPool[className] || [];
        if (skillPool.length === 0) {
            return [];
        }
        
        // 스킬 풀을 복사하여 셔플
        const shuffledSkills = [...skillPool].sort(() => Math.random() - 0.5);
        
        // 적의 경우 1~2개의 스킬만 선택
        const skillCount = Math.min(2, shuffledSkills.length);
        const selectedSkills = shuffledSkills.slice(0, skillCount);
        
        return selectedSkills;
    }
    
    // 용병 장비 장착 함수
    function equipItem(mercenary, item) {
        if (!mercenary || !item) return false;
        
        // 아이템 타입에 따라 장착 슬롯 결정
        switch (item.type) {
            case 'weapon':
                mercenary.equipment.weapon = item;
                break;
            case 'armor':
                mercenary.equipment.armor = item;
                break;
            case 'accessory':
                mercenary.equipment.accessory = item;
                break;
            default:
                return false;
        }
        
        // 장비 스탯 적용
        applyEquipmentStats(mercenary);
        
        return true;
    }
    
    // 용병 장비 해제 함수
    function unequipItem(mercenary, slotName) {
        if (!mercenary || !mercenary.equipment[slotName]) return null;
        
        const unequippedItem = mercenary.equipment[slotName];
        mercenary.equipment[slotName] = null;
        
        // 장비 스탯 재적용
        applyEquipmentStats(mercenary);
        
        return unequippedItem;
    }
    
    // 장비 스탯 적용 함수
    function applyEquipmentStats(mercenary) {
        // 우선 기본 스탯으로 초기화
        const baseStats = classBaseStats[mercenary.class];
        const levelMultiplier = 1 + (mercenary.level - 1) * 0.1;
        
        mercenary.maxHp = Math.floor(baseStats.hp * levelMultiplier);
        mercenary.atk = Math.floor(baseStats.atk * levelMultiplier);
        mercenary.def = Math.floor(baseStats.def * levelMultiplier);
        mercenary.str = Math.floor(baseStats.str * levelMultiplier);
        mercenary.int = Math.floor(baseStats.int * levelMultiplier);
        mercenary.valor = Math.floor(baseStats.valor * levelMultiplier);
        mercenary.weight = Math.floor(baseStats.weight * levelMultiplier);
        
        // 각 장비 슬롯 스탯 추가
        const equipment = mercenary.equipment;
        
        // 무기 스탯 적용
        if (equipment.weapon) {
            Object.entries(equipment.weapon.stats).forEach(([stat, value]) => {
                if (stat in mercenary) {
                    mercenary[stat] += value;
                }
            });
        }
        
        // 방어구 스탯 적용
        if (equipment.armor) {
            Object.entries(equipment.armor.stats).forEach(([stat, value]) => {
                if (stat in mercenary) {
                    mercenary[stat] += value;
                }
            });
        }
        
        // 악세서리 스탯 적용
        if (equipment.accessory) {
            Object.entries(equipment.accessory.stats).forEach(([stat, value]) => {
                if (stat in mercenary) {
                    mercenary[stat] += value;
                }
            });
        }
        
        // 장비에 의한 무게 영향 계산
        let weightReduction = 0;
        
        // 힘에 의한 무게 감소 (힘 1당 무게 감소 0.5)
        weightReduction += mercenary.str * 0.5;
        
        // 최종 무게 (음수가 되지 않도록)
        mercenary.weight = Math.max(1, mercenary.weight - weightReduction);
        
        // 체력은 최대 체력을 초과하지 않도록
        if (mercenary.hp > mercenary.maxHp) {
            mercenary.hp = mercenary.maxHp;
        }
    }
    
    // 공개 메서드
    return {
        createMercenary,
        createEnemy,
        equipItem,
        unequipItem
    };
})();

// 아이템 팩토리 모듈
const ItemFactory = (() => {
    // 아이템 ID 생성 카운터
    let idCounter = 1;
    
    // 무기 생성 함수
    function createWeapon(name, level, stats) {
        return {
            id: `wpn_${idCounter++}`,
            name: name,
            type: 'weapon',
            level: level,
            stats: stats || {},
            description: `${name} - 레벨 ${level} 무기`
        };
    }
    
    // 방어구 생성 함수
    function createArmor(name, level, stats) {
        return {
            id: `arm_${idCounter++}`,
            name: name,
            type: 'armor',
            level: level,
            stats: stats || {},
            description: `${name} - 레벨 ${level} 방어구`
        };
    }
    
    // 악세서리 생성 함수
    function createAccessory(name, level, stats) {
        return {
            id: `acc_${idCounter++}`,
            name: name,
            type: 'accessory',
            level: level,
            stats: stats || {},
            description: `${name} - 레벨 ${level} 악세서리`
        };
    }
    
    // 랜덤 아이템 생성 함수
    function createRandomItem(level) {
        const itemTypes = ['weapon', 'armor', 'accessory'];
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        // 아이템 품질 랜덤 결정 (희귀도)
        const qualityRoll = Math.random();
        let quality, qualityPrefix;
        
        if (qualityRoll < 0.6) {
            quality = 1.0; // 일반 (60%)
            qualityPrefix = "";
        } else if (qualityRoll < 0.85) {
            quality = 1.3; // 고급 (25%)
            qualityPrefix = "고급 ";
        } else if (qualityRoll < 0.95) {
            quality = 1.6; // 희귀 (10%)
            qualityPrefix = "희귀한 ";
        } else {
            quality = 2.0; // 전설 (5%)
            qualityPrefix = "전설적인 ";
        }
        
        // 기본 스탯 설정
        const baseStatValue = level * 2;
        
        // 아이템 이름 및 스탯 결정
        let name, stats;
        
        switch (type) {
            case 'weapon':
                const weaponTypes = ['검', '도끼', '지팡이', '활', '단검'];
                const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
                name = `${qualityPrefix}${weaponType}`;
                
                // 무기 스탯 (공격력 + 주요 스탯 1개)
                stats = {
                    atk: Math.floor(baseStatValue * quality)
                };
                
                // 추가 스탯 (힘 또는 지력)
                if (Math.random() < 0.7) {
                    const mainStat = Math.random() < 0.5 ? 'str' : 'int';
                    stats[mainStat] = Math.floor((baseStatValue / 2) * quality);
                }
                
                // 가끔 용맹 추가 (20% 확률)
                if (Math.random() < 0.2) {
                    stats.valor = Math.floor((baseStatValue / 3) * quality);
                }
                
                return createWeapon(name, level, stats);
                
            case 'armor':
                const armorTypes = ['갑옷', '로브', '튜닉', '판금', '가죽 갑옷'];
                const armorType = armorTypes[Math.floor(Math.random() * armorTypes.length)];
                name = `${qualityPrefix}${armorType}`;
                
                // 방어구 스탯 (방어력 + 체력)
                stats = {
                    def: Math.floor(baseStatValue * quality),
                    maxHp: Math.floor((baseStatValue * 3) * quality)
                };
                
                // 무게 추가
                stats.weight = Math.floor((baseStatValue / 3) * quality);
                
                // 추가 스탯 (힘, 지력, 용맹 중 하나)
                if (Math.random() < 0.5) {
                    const additionalStat = ['str', 'int', 'valor'][Math.floor(Math.random() * 3)];
                    stats[additionalStat] = Math.floor((baseStatValue / 3) * quality);
                }
                
                return createArmor(name, level, stats);
                
            case 'accessory':
                const accessoryTypes = ['목걸이', '반지', '귀걸이', '팔찌', '벨트'];
                const accessoryType = accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)];
                name = `${qualityPrefix}${accessoryType}`;
                
                // 악세서리 스탯 (다양한 스탯 중 2개)
                stats = {};
                
                // 첫번째 스탯 (무조건 추가)
                const firstStat = ['str', 'int', 'valor', 'atk', 'def'][Math.floor(Math.random() * 5)];
                stats[firstStat] = Math.floor((baseStatValue / 2) * quality);
                
                // 두번째 스탯 (60% 확률로 추가)
                if (Math.random() < 0.6) {
                    let secondStat;
                    do {
                        secondStat = ['str', 'int', 'valor', 'atk', 'def', 'maxHp'][Math.floor(Math.random() * 6)];
                    } while (secondStat === firstStat);
                    
                    stats[secondStat] = Math.floor((baseStatValue / 3) * quality);
                }
                
                return createAccessory(name, level, stats);
        }
    }
    
    // 공개 메서드
    return {
        createWeapon,
        createArmor,
        createAccessory,
        createRandomItem
    };
})();