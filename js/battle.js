import { characters } from './character.js';
import { getRandomSkill } from './skill.js';
import { updateHpBar, updateShieldBar, logBattle } from './ui.js';

let isAutoBattle = false;

export function startBattle() {
    isAutoBattle = true;
    logBattle('전투를 시작합니다!');
    autoBattleLoop();
}

async function autoBattleLoop() {
    while (isAutoBattle) {
        const aliveCharacters = characters.filter(c => c.hp > 0);
        aliveCharacters.sort((a, b) => a.weight - b.weight);

        for (const unit of aliveCharacters) {
            if (!isAutoBattle) break;
            if (unit.hp <= 0) continue;

            await sleep(800);
            handleTurn(unit);

            if (isBattleOver()) {
                isAutoBattle = false;
                const winner = getTeamAlive('player') ? '🎉 플레이어 승리!' : '💀 적 승리...';
                logBattle(`<strong>${winner}</strong>`);
                break;
            }
        }
    }
}

function handleTurn(unit) {
    const isPlayer = unit.team === 'player';
    const allies = characters.filter(c => c.team === unit.team && c.hp > 0);
    const enemies = characters.filter(c => c.team !== unit.team && c.hp > 0);
    if (enemies.length === 0 || allies.length === 0) return;

    const skill = getRandomSkill(unit.skills);
    if (!skill) {
        // 평타
        const target = getRandomTarget(enemies);
        if (!target) return;
        dealDamage(unit, target, 10, '기본 평타');
    } else if (skill.type === 'heal') {
        const target = getLowestHpTarget(allies);
        if (!target) return;
        const healed = Math.min(skill.amount, 100 - target.hp);
        target.hp += healed;
        logBattle(`💚 ${unit.name}의 ${skill.name} 발동! ${target.name} 회복 +${healed}`);
        updateHpBar(target);
    } else {
        const target = getLowestHpTarget(enemies);
        if (!target) return;
        dealDamage(unit, target, skill.damage, skill.name);
    }
}

function dealDamage(attacker, target, damage, skillName) {
    let effectiveDamage = damage;
    if (target.shield > 0) {
        const shieldAbsorb = Math.min(target.shield, damage);
        target.shield -= shieldAbsorb;
        effectiveDamage -= shieldAbsorb;
        updateShieldBar(target);
        logBattle(`🛡️ ${target.name}의 방어막이 ${shieldAbsorb}만큼 흡수!`);
    }

    target.hp -= effectiveDamage;
    if (target.hp < 0) target.hp = 0;
    updateHpBar(target);
    logBattle(`⚔️ ${attacker.name}의 ${skillName}! ${target.name}에게 ${effectiveDamage} 데미지!`);

    if (target.hp <= 0) {
        logBattle(`💀 ${target.name} 사망!`);
    }
}

function getLowestHpTarget(units) {
    return [...units].sort((a, b) => a.hp - b.hp)[0];
}

function getRandomTarget(units) {
    return units[Math.floor(Math.random() * units.length)];
}

function getTeamAlive(team) {
    return characters.some(c => c.team === team && c.hp > 0);
}

function isBattleOver() {
    return !getTeamAlive('player') || !getTeamAlive('enemy');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
