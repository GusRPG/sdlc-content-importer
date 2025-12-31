// ===================================================================
// SOTDL PARSER SYSTEM - Modular Architecture
// ===================================================================

const SEPARATOR = 'º';

// ===================================================================
// UTILIDADES
// ===================================================================
class SOTDLUtils {
    static log(message) {
        console.log("SOTDL Parser | " + message);
    }

    static camelize(str) {
        if (!str) return str;
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
            .replace(/\s+/g, ' ');
    }

    static makeDiceRollable(text) {
        if (!text) return text;
        const dicePattern = /\b(\d+d\d+(?:\s*[+-]\s*(?:\d+d\d+|\d+))*)\b/g;
        return text.replace(dicePattern, '[[/r $1]]').replace(/\s*([+-])\s*/g, '$1');
    }

    static generateId() {
        let id = '';
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 16; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    static splitLines(text) {
        return text.split('\n').map(l => l.trim()).filter(l => l);
    }
}

// ===================================================================
// CREADORES DE ITEMS
// ===================================================================
class SOTDLItemFactory {
    static createWeapon(name, attackType = "Strength", bonus = "", boonsbanes = "",
        damage = "", properties = "", description = "", extraEffect = "",
        plus20damage = "", extraEffect20 = "") {
        const now = Date.now();
        return {
            name: name,
            type: "weapon",
            img: properties.toLowerCase().includes("melee") || properties.toLowerCase().includes("reach") ?
                "systems/demonlord/assets/icons/weapons/fist.webp" :
                "icons/magic/light/explosion-impact-purple.webp",
            system: {
                description: description ? `<p>${SOTDLUtils.makeDiceRollable(description)}</p>` : "",
                action: {
                    active: true,
                    against: "Defense",
                    damageactive: !!damage,
                    damage: damage || "",
                    damagetype: "",
                    boonsbanesactive: !!boonsbanes,
                    boonsbanes: boonsbanes || "",
                    plus20active: true,
                    plus20: "",
                    plus20damage: plus20damage || "",
                    defense: "",
                    defenseboonsbanes: "",
                    damagetypes: [],
                    strengthboonsbanesselect: false,
                    agilityboonsbanesselect: false,
                    intellectboonsbanesselect: false,
                    willboonsbanesselect: false,
                    perceptionboonsbanesselect: false,
                    extraboonsbanes: "",
                    extradamage: "",
                    extraplus20damage: "",
                    attack: attackType || "Strength",
                    rollbonus: bonus || "",
                    extraEffect: SOTDLUtils.makeDiceRollable(extraEffect) || "",
                    extraEffect20: SOTDLUtils.makeDiceRollable(extraEffect20) || ""
                },
                hands: "",
                properties: properties || "",
                wear: true,
                quantity: 1,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }

    static createFeature(name, description) {
        const now = Date.now();
        return {
            name: name,
            type: "feature",
            img: "systems/demonlord/assets/icons/skills/fist.webp",
            system: {
                description: `<p>${SOTDLUtils.makeDiceRollable(description)}</p>`,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }

    static createTalent(name, description) {
        const now = Date.now();
        return {
            name: name,
            type: "talent",
            img: "systems/demonlord/assets/icons/skills/fist.webp",
            system: {
                description: `<p>${SOTDLUtils.makeDiceRollable(description)}</p>`,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }

    static createSpecialAction(name, description) {
        const now = Date.now();
        return {
            name: name,
            type: "specialaction",
            img: "systems/demonlord/assets/icons/weapons/fist.webp",
            system: {
                description: `<p>${SOTDLUtils.makeDiceRollable(description)}</p>`,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }

    static createEndOfRoundAction(name, description) {
        const now = Date.now();
        return {
            name: name,
            type: "endoftheround",
            img: "icons/commodities/tech/watch.webp",
            system: {
                description: `<p>${SOTDLUtils.makeDiceRollable(description)}</p>`,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }

    static createSpell(name, rank) {
        const now = Date.now();
        return {
            name: name,
            type: "spell",
            img: "systems/demonlord/assets/icons/skills/spellbook.webp",
            system: {
                description: "",
                tradition: "",
                rank: parseInt(rank) || 0,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }
}

// ===================================================================
// PARSER DE FEATURES/RASGOS
// ===================================================================
class FeatureParser {
    static parseText(inputText) {
        if (!inputText) {
            return { success: false, error: "No input provided", items: [] };
        }

        const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
        const items = [];
        let currentItem = '';
        const errors = [];

        for (let line of lines) {
            if (line.includes(SEPARATOR)) {
                if (currentItem) {
                    try {
                        const parts = currentItem.split(SEPARATOR);
                        const name = parts[0].trim();
                        const description = parts.slice(1).join(SEPARATOR).trim();
                        if (name) {
                            items.push(SOTDLItemFactory.createFeature(name, description));
                        }
                    } catch (error) {
                        errors.push(['Feature', error.message]);
                    }
                }
                currentItem = line;
            } else if (currentItem) {
                currentItem += ' ' + line;
            }
        }

        if (currentItem) {
            try {
                const parts = currentItem.split(SEPARATOR);
                const name = parts[0].trim();
                const description = parts.slice(1).join(SEPARATOR).trim();
                if (name) {
                    items.push(SOTDLItemFactory.createFeature(name, description));
                }
            } catch (error) {
                errors.push(['Feature', error.message]);
            }
        }

        return {
            success: items.length > 0,
            items: items,
            errors: errors
        };
    }
}

// ===================================================================
// PARSER DE ARMAS
// ===================================================================
class SOTDLWeaponParser {
    static parseWeaponLine(line, items, addedWeapons) {
        const attackMatch = line.match(/^([^()]+?)\s*\(([^)]+)\)\s*([+\-]?\d+)?\s*(?:with\s+(\d+)\s+boons?|with\s+(\d+)\s+banes?)?\s*\(([^)]+)\)(.*)/i);

        if (!attackMatch) return false;

        const weaponName = attackMatch[1].trim();
        const typesString = attackMatch[2].trim();
        let bonus = attackMatch[3] || "";
        if (bonus.startsWith('+')) bonus = bonus.slice(1);

        let boonsbanes = "";
        if (attackMatch[4]) {
            boonsbanes = attackMatch[4];
        } else if (attackMatch[5]) {
            boonsbanes = "-" + attackMatch[5];
        }

        let damageStr = attackMatch[6].trim();
        let extraText = attackMatch[7] ? attackMatch[7].trim() : "";

        const types = typesString.split(/\s+or\s+/i).map(t => t.trim());
        if (types.length === 0) return false;

        let extraEffect = "";
        const plusMatch = damageStr.match(/(.*?)\s+plus\s+([^)]+)/i);
        if (plusMatch) {
            damageStr = plusMatch[1].trim();
            extraEffect = plusMatch[2].trim();
        }

        damageStr = damageStr.replace(/\s+plus\s+/gi, '+').replace(/\s*([+-])\s*/g, '$1');

        const damageParts = [];
        damageStr.split('+').forEach(p => {
            p = p.trim();
            let val, typ = '';
            if (/\s/.test(p)) {
                const splits = p.split(/\s+/);
                val = splits[0].trim();
                typ = splits.slice(1).join(' ').trim().toLowerCase();
            } else {
                val = p;
            }
            if (/d/i.test(val)) {
                damageParts.push({ damage: val, damagetype: typ });
            } else if (damageParts.length > 0) {
                const last = damageParts[damageParts.length - 1];
                last.damage += '+' + val;
                if (typ) last.damagetype = typ;
            } else {
                damageParts.push({ damage: val, damagetype: typ });
            }
        });

        let descriptionText = "";
        let extraEffect20 = "";
        let plus20damage = "";

        const descriptionMatch = extraText.match(/ººº([^º]+?)ººº/);
        if (descriptionMatch) {
            descriptionText = descriptionMatch[1].trim();
            extraText = extraText.replace(/ººº[^º]+?ººº/, '').trim();
        }

        const extraEffect20Match = extraText.match(/ºº([^º]+?)ºº/);
        if (extraEffect20Match) {
            extraEffect20 = extraEffect20Match[1].trim();
            extraText = extraText.replace(/ºº[^º]+?ºº/, '').trim();
        }

        const plus20damageMatch = extraText.match(/º\(([^)]+)\)º/);
        if (plus20damageMatch) {
            plus20damage = plus20damageMatch[1].trim();
            plus20damage = plus20damage.replace(/\s+plus\s+/gi, '+').replace(/\s*([+-])\s*/g, '$1');
            extraText = extraText.replace(/º\([^)]+\)º/, '').trim();
        }

        const extraEffectMatch = extraText.match(/º([^º]+?)º/);
        if (extraEffectMatch) {
            extraEffect = extraEffectMatch[1].trim();
        }

        const weaponsInThisLine = new Set();

        types.forEach(type => {
            const typeMatch = type.match(/^(melee|reach|range|short\s+range|medium\s+range|long\s+range|extreme\s+range)(?:\s+(\d+))?/i);
            if (!typeMatch) return;

            const baseType = typeMatch[1].toLowerCase();
            const reachValue = typeMatch[2] || "1";

            const attackType = (baseType.includes("melee") || baseType.includes("reach")) ? "Strength" : "Agility";

            let properties = "";
            if (baseType.includes("melee")) {
                properties = "Melee";
            } else if (baseType.includes("reach")) {
                properties = `Reach (${reachValue})`;
            } else if (baseType.includes("short")) {
                properties = "Range (short) (5)";
            } else if (baseType.includes("medium")) {
                properties = "Range (medium) (20)";
            } else if (baseType.includes("long")) {
                properties = "Range (long) (100)";
            } else if (baseType.includes("extreme")) {
                properties = "Range (extreme) (500)";
            }

            const weapon = SOTDLItemFactory.createWeapon(
                weaponName,
                attackType,
                bonus,
                boonsbanes,
                "",
                properties,
                descriptionText,
                extraEffect,
                plus20damage,
                extraEffect20
            );

            if (damageParts.length > 0) {
                weapon.system.action.damage = damageParts[0].damage;
                weapon.system.action.damagetype = damageParts[0].damagetype || "";
                if (damageParts.length > 1) {
                    weapon.system.action.damagetypes = damageParts.slice(1).map(d => ({
                        damage: d.damage,
                        damagetype: d.damagetype || ""
                    }));
                }
            }

            const uniqueKey = `${weaponName}_${properties}`;
            if (!weaponsInThisLine.has(uniqueKey)) {
                items.push(weapon);
                weaponsInThisLine.add(uniqueKey);
            }
        });

        return true;
    }
}

// ===================================================================
// PARSER DE CRIATURAS (TU CÓDIGO ACTUAL)
// ===================================================================
class SOTDLCreatureParser {
    async parseInput(inputText, cleanTraditions = true) {
        if (!inputText) {
            return { success: false, error: "No input provided" };
        }

        const lines = SOTDLUtils.splitLines(inputText);
        const errors = [];
        const creatures = [];

        const difficultyIndices = [];
        lines.forEach((line, idx) => {
            if (/DIFFICULTY/.test(line)) {
                difficultyIndices.push(idx);
            }
        });

        if (difficultyIndices.length === 0) {
            return { success: false, error: "No DIFFICULTY found in text" };
        }

        const creatureBlocks = [];
        for (let i = 0; i < difficultyIndices.length; i++) {
            const startIdx = difficultyIndices[i];
            const endIdx = i + 1 < difficultyIndices.length ? difficultyIndices[i + 1] - 1 : lines.length - 1;
            const blockLines = lines.slice(startIdx, endIdx + 1);
            creatureBlocks.push(blockLines);
        }

        for (let blockIdx = 0; blockIdx < creatureBlocks.length; blockIdx++) {
            try {
                const creature = await this.parseCreatureBlock(creatureBlocks[blockIdx], cleanTraditions);
                creatures.push(creature);
            } catch (error) {
                SOTDLUtils.log(`Error parsing creature ${blockIdx + 1}: ${error.message}`);
                errors.push([`Creature ${blockIdx + 1}`, error.message]);
            }
        }

        return { success: true, creatures: creatures, errors: errors };
    }

    async parseCreatureBlock(blockLines, cleanTraditions) {
        const fullText = blockLines.join('\n');

        let name = blockLines[0].trim();
        let difficulty = 0;
        const diffMatch = blockLines[0].match(/^(.*?)(?:º+)?\s*DIFFICULTY[:\s]+(\d+)/);
        if (diffMatch) {
            name = diffMatch[1].trim();
            difficulty = parseInt(diffMatch[2]);
        } else {
            name = blockLines[0].replace(/º+/g, '').trim();
        }

        let stats = {
            size: "1",
            perception: 10,
            defense: 0,
            health: 0,
            insanity: 0,
            corruption: 0,
            strength: 10,
            agility: 10,
            intellect: 10,
            will: 10,
            speed: 10,
            power: 0,
            frightening: false,
            horrifying: false,
            perceptionsenses: "",
            speedtraits: "",
            descriptor: "",
            description: ""
        };

        this.parseBasicStats(fullText, stats);

        const items = [];
        const addedItems = new Set();

        await this.parseTraits(blockLines, items, addedItems);
        await this.parseAttackOptions(blockLines, items, addedItems);
        await this.parseSpecialAttacks(blockLines, items, addedItems);
        await this.parseSpecialActions(blockLines, items, addedItems);
        await this.parseEndOfRound(blockLines, items, addedItems);
        await this.parseMagic(blockLines, items, addedItems, stats, cleanTraditions);
        await this.parseDescription(blockLines, stats);

        const actorData = this.buildActorData(name, difficulty, stats, items);

        return actorData;
    }

    parseBasicStats(fullText, stats) {
        const sizeLineMatch = fullText.match(/Size\s+([\d\/]+|[a-zA-Z]+)(?:\s+(.+))?/i);
        if (sizeLineMatch) {
            stats.size = sizeLineMatch[1];
            if (sizeLineMatch[2]) {
                let descriptorText = sizeLineMatch[2].trim();
                if (/fright\w*ning/i.test(descriptorText)) {
                    stats.frightening = true;
                    descriptorText = descriptorText.replace(/fright\w*ning/i, '').trim();
                }
                if (/horrifying/i.test(descriptorText)) {
                    stats.horrifying = true;
                    descriptorText = descriptorText.replace(/horrifying/i, '').trim();
                }
                stats.descriptor = descriptorText.replace(/\s+/g, ' ').trim() || "";
            }
        }

        const percLineMatch = fullText.match(/Perception\s+(\d+)(?:\s*\([+\-–]?\d+\))?\s*;\s*(.*)/i);
        if (percLineMatch) {
            stats.perception = parseInt(percLineMatch[1]);
            stats.perceptionsenses = percLineMatch[2].trim();
        }

        const defMatch = fullText.match(/Defense\s+(\d+)/i);
        if (defMatch) stats.defense = parseInt(defMatch[1]);

        const healthMatch = fullText.match(/Health\s+(\d+)/i);
        if (healthMatch) stats.health = parseInt(healthMatch[1]);

        const insMatch = fullText.match(/Insanity\s+([—–-]|\d+)/i);
        if (insMatch) {
            stats.insanity = insMatch[1].match(/[—–-]/) ? 0 : parseInt(insMatch[1]);
        }

        const corrMatch = fullText.match(/Corruption\s+(\d+)/i);
        if (corrMatch) stats.corruption = parseInt(corrMatch[1]);

        const strMatch = fullText.match(/Strength\s+([—–-]|\d+)/i);
        if (strMatch) stats.strength = strMatch[1].match(/[—–-]/) ? 0 : parseInt(strMatch[1]);

        const agiMatch = fullText.match(/Agility\s+([\d\-–]+)/i);
        if (agiMatch) stats.agility = parseInt(agiMatch[1].replace(/–/g, '-'));

        const intMatch = fullText.match(/Intellect\s+([\d\-–]+)/i);
        if (intMatch) stats.intellect = parseInt(intMatch[1].replace(/–/g, '-'));

        const wilMatch = fullText.match(/Will\s+([\d\-–]+)/i);
        if (wilMatch) stats.will = parseInt(wilMatch[1].replace(/–/g, '-'));

        const speedMatch = fullText.match(/Speed\s+(\d+)/i);
        if (speedMatch) {
            stats.speed = parseInt(speedMatch[1]);
            stats.speedtraits = `Speed ${stats.speed}`;
        }
    }

    async parseTraits(blockLines, items, addedItems) {
        const traitsIndex = blockLines.findIndex(l => /^traits$/i.test(l));
        if (traitsIndex === -1) return;

        let i = traitsIndex + 1;
        let currentTrait = null;
        let currentDescription = "";

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(ATTACK\s+OPTIONS|SPECIAL\s+ATTACKS|SPECIAL\s+ACTIONS|END\s+OF\s+(?:THE\s+)?ROUND|REACTIONS|MAGICAL|MAGIC|DESCRIPTION)$/i.test(line)) {
                if (currentTrait && !addedItems.has(currentTrait)) {
                    items.push(SOTDLItemFactory.createFeature(currentTrait, currentDescription.trim()));
                    addedItems.add(currentTrait);
                }
                break;
            }

            if (SOTDLWeaponParser.parseWeaponLine(line, items, addedItems)) {
                i++;
                continue;
            }

            if (line.includes(SEPARATOR)) {
                if (currentTrait && !addedItems.has(currentTrait)) {
                    items.push(SOTDLItemFactory.createFeature(currentTrait, currentDescription.trim()));
                    addedItems.add(currentTrait);
                }
                const parts = line.split(SEPARATOR);
                currentTrait = parts[0].trim();
                currentDescription = parts.slice(1).join(SEPARATOR).trim();
            } else if (currentTrait) {
                currentDescription += (currentDescription ? ' ' : '') + line;
            } else {
                const traitMatch = line.match(/^([^º]+?)(?:\s+(.+))?$/i);
                if (traitMatch) {
                    if (currentTrait && !addedItems.has(currentTrait)) {
                        items.push(SOTDLItemFactory.createFeature(currentTrait, currentDescription.trim()));
                        addedItems.add(currentTrait);
                    }
                    currentTrait = traitMatch[1].trim();
                    currentDescription = traitMatch[2] ? traitMatch[2].trim() : "";
                }
            }
            i++;
        }

        if (currentTrait && !addedItems.has(currentTrait)) {
            items.push(SOTDLItemFactory.createFeature(currentTrait, currentDescription.trim()));
            addedItems.add(currentTrait);
        }
    }

    async parseAttackOptions(blockLines, items, addedItems) {
        const attacksIndex = blockLines.findIndex(l => /^attack\s+options$/i.test(l));
        if (attacksIndex === -1) return;

        let i = attacksIndex + 1;
        let currentAttack = null;
        let currentDescription = "";

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(TRAITS|SPECIAL\s+ATTACKS|SPECIAL\s+ACTIONS|END\s+OF\s+(?:THE\s+)?ROUND|REACTIONS|MAGICAL|MAGIC|DESCRIPTION)$/i.test(line)) {
                if (currentAttack && !addedItems.has(currentAttack)) {
                    items.push(SOTDLItemFactory.createTalent(currentAttack, currentDescription.trim()));
                    addedItems.add(currentAttack);
                }
                break;
            }

            if (SOTDLWeaponParser.parseWeaponLine(line, items, addedItems)) {
                i++;
                continue;
            }

            if (line.includes(SEPARATOR)) {
                if (currentAttack && !addedItems.has(currentAttack)) {
                    items.push(SOTDLItemFactory.createTalent(currentAttack, currentDescription.trim()));
                    addedItems.add(currentAttack);
                }
                const parts = line.split(SEPARATOR);
                currentAttack = parts[0].trim();
                currentDescription = parts.slice(1).join(SEPARATOR).trim();
            } else if (currentAttack) {
                currentDescription += (currentDescription ? ' ' : '') + line;
            } else {
                const match = line.match(/^([^º]+?)(?:\s+(.+))?$/i);
                if (match) {
                    if (currentAttack && !addedItems.has(currentAttack)) {
                        items.push(SOTDLItemFactory.createTalent(currentAttack, currentDescription.trim()));
                        addedItems.add(currentAttack);
                    }
                    currentAttack = match[1].trim();
                    currentDescription = match[2] ? match[2].trim() : "";
                }
            }
            i++;
        }

        if (currentAttack && !addedItems.has(currentAttack)) {
            items.push(SOTDLItemFactory.createTalent(currentAttack, currentDescription.trim()));
            addedItems.add(currentAttack);
        }
    }

    async parseSpecialAttacks(blockLines, items, addedItems) {
        const index = blockLines.findIndex(l => /^special\s+attacks$/i.test(l));
        if (index === -1) return;

        let i = index + 1;
        let current = null;
        let description = "";

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(TRAITS|ATTACK\s+OPTIONS|SPECIAL\s+ACTIONS|END\s+OF\s+(?:THE\s+)?ROUND|REACTIONS|MAGICAL|MAGIC|DESCRIPTION)$/i.test(line)) {
                if (current && !addedItems.has(current)) {
                    items.push(SOTDLItemFactory.createTalent(current, description.trim()));
                    addedItems.add(current);
                }
                break;
            }

            if (SOTDLWeaponParser.parseWeaponLine(line, items, addedItems)) {
                i++;
                continue;
            }

            if (line.includes(SEPARATOR)) {
                if (current && !addedItems.has(current)) {
                    items.push(SOTDLItemFactory.createTalent(current, description.trim()));
                    addedItems.add(current);
                }
                const parts = line.split(SEPARATOR);
                current = parts[0].trim();
                description = parts.slice(1).join(SEPARATOR).trim();
            } else if (current) {
                description += (description ? ' ' : '') + line;
            } else {
                const match = line.match(/^([^º]+?)(?:\s+(.+))?$/i);
                if (match) {
                    if (current && !addedItems.has(current)) {
                        items.push(SOTDLItemFactory.createTalent(current, description.trim()));
                        addedItems.add(current);
                    }
                    current = match[1].trim();
                    description = match[2] ? match[2].trim() : "";
                }
            }
            i++;
        }

        if (current && !addedItems.has(current)) {
            items.push(SOTDLItemFactory.createTalent(current, description.trim()));
            addedItems.add(current);
        }
    }

    async parseSpecialActions(blockLines, items, addedItems) {
        const index = blockLines.findIndex(l => /^special\s+actions$/i.test(l));
        if (index === -1) return;

        let i = index + 1;
        let current = null;
        let description = "";

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(TRAITS|ATTACK\s+OPTIONS|SPECIAL\s+ATTACKS|END\s+OF\s+(?:THE\s+)?ROUND|REACTIONS|MAGICAL|MAGIC|DESCRIPTION)$/i.test(line)) {
                if (current && !addedItems.has(current)) {
                    items.push(SOTDLItemFactory.createSpecialAction(current, description.trim()));
                    addedItems.add(current);
                }
                break;
            }

            if (SOTDLWeaponParser.parseWeaponLine(line, items, addedItems)) {
                i++;
                continue;
            }

            if (line.includes(SEPARATOR)) {
                if (current && !addedItems.has(current)) {
                    items.push(SOTDLItemFactory.createSpecialAction(current, description.trim()));
                    addedItems.add(current);
                }
                const parts = line.split(SEPARATOR);
                current = parts[0].trim();
                description = parts.slice(1).join(SEPARATOR).trim();
            } else if (current) {
                description += (description ? ' ' : '') + line;
            } else {
                const match = line.match(/^([^º]+?)(?:\s+(.+))?$/i);
                if (match) {
                    if (current && !addedItems.has(current)) {
                        items.push(SOTDLItemFactory.createSpecialAction(current, description.trim()));
                        addedItems.add(current);
                    }
                    current = match[1].trim();
                    description = match[2] ? match[2].trim() : "";
                }
            }
            i++;
        }

        if (current && !addedItems.has(current)) {
            items.push(SOTDLItemFactory.createSpecialAction(current, description.trim()));
            addedItems.add(current);
        }
    }

    async parseEndOfRound(blockLines, items, addedItems) {
        const index = blockLines.findIndex(l => /^end\s+of\s+(?:the\s+)?round$/i.test(l));
        if (index === -1) return;

        let i = index + 1;
        let current = null;
        let description = "";

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(TRAITS|ATTACK\s+OPTIONS|SPECIAL\s+ATTACKS|SPECIAL\s+ACTIONS|REACTIONS|MAGICAL|MAGIC|DESCRIPTION)$/i.test(line)) {
                if (current && !addedItems.has(current)) {
                    items.push(SOTDLItemFactory.createEndOfRoundAction(current, description.trim()));
                    addedItems.add(current);
                }
                break;
            }

            if (SOTDLWeaponParser.parseWeaponLine(line, items, addedItems)) {
                i++;
                continue;
            }

            if (line.includes(SEPARATOR)) {
                if (current && !addedItems.has(current)) {
                    items.push(SOTDLItemFactory.createEndOfRoundAction(current, description.trim()));
                    addedItems.add(current);
                }
                const parts = line.split(SEPARATOR);
                current = parts[0].trim();
                description = parts.slice(1).join(SEPARATOR).trim();
            } else if (current) {
                description += (description ? ' ' : '') + line;
            } else {
                const match = line.match(/^([^º]+?)(?:\s+(.+))?$/i);
                if (match) {
                    if (current && !addedItems.has(current)) {
                        items.push(SOTDLItemFactory.createEndOfRoundAction(current, description.trim()));
                        addedItems.add(current);
                    }
                    current = match[1].trim();
                    description = match[2] ? match[2].trim() : "";
                }
            }
            i++;
        }

        if (current && !addedItems.has(current)) {
            items.push(SOTDLItemFactory.createEndOfRoundAction(current, description.trim()));
            addedItems.add(current);
        }
    }

    async parseMagic(blockLines, items, addedItems, stats, cleanTraditions) {
        const magicIndex = blockLines.findIndex(l => /^(MAGICAL|MAGIC)$/i.test(l));
        if (magicIndex === -1) return;

        let i = magicIndex + 1;
        let spellLines = [];
        let descriptionLines = [];

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(TRAITS|ATTACK\s+OPTIONS|SPECIAL\s+ATTACKS|SPECIAL\s+ACTIONS|END\s+OF\s+(?:THE\s+)?ROUND|REACTIONS|DESCRIPTION)$/i.test(line)) {
                break;
            }

            if (SOTDLWeaponParser.parseWeaponLine(line, items, addedItems)) {
                i++;
                continue;
            }

            const powerMatch = line.match(/power\s+(\d+)/i);
            if (powerMatch) {
                stats.power = parseInt(powerMatch[1]);
                i++;
                continue;
            }

            if (line.match(/\(.+\)/)) {
                spellLines.push(line);
            } else {
                descriptionLines.push(line);
            }
            i++;
        }

        if (cleanTraditions) {
            for (let j = 0; j < spellLines.length; j++) {
                spellLines[j] = spellLines[j].replace(/^[A-Z][a-z]*\s+/, '');
            }
        }

        if (descriptionLines.length > 0) {
            stats.description += (stats.description ? ' ' : '') + descriptionLines.join(' ');
        }

        if (spellLines.length > 0) {
            const spellText = spellLines.join('');
            const spellArray = spellText.split(',').map(s => s.trim()).filter(s => s);
            spellArray.forEach(spell => {
                const match = spell.match(/^(.*?)\s*\((\d+)\)$/);
                if (match) {
                    const spellName = match[1].trim();
                    const rank = match[2];
                    if (!addedItems.has(spellName)) {
                        items.push(SOTDLItemFactory.createSpell(spellName, rank));
                        addedItems.add(spellName);
                    }
                }
            });
        }
    }

    async parseDescription(blockLines, stats) {
        const descriptionIndex = blockLines.findIndex(l => /^DESCRIPTION$/i.test(l.trim()));
        if (descriptionIndex === -1) return;

        let i = descriptionIndex + 1;
        let descriptionLines = [];

        while (i < blockLines.length) {
            const line = blockLines[i];
            if (!line) { i++; continue; }

            if (/^(TRAITS|ATTACK\s+OPTIONS|SPECIAL\s+ATTACKS|SPECIAL\s+ACTIONS|END\s+OF\s+(?:THE\s+)?ROUND|REACTIONS|MAGICAL|MAGIC)$/i.test(line)) {
                break;
            }

            descriptionLines.push(line);
            i++;
        }

        if (descriptionLines.length > 0) {
            let descText = descriptionLines.join(' ').split(SEPARATOR).join('<br>');
            stats.description += (stats.description ? '\n' : '') + descText;
        }
    }

    buildActorData(name, difficulty, stats, items) {
        const now = Date.now();

        let sizeNum = parseFloat(stats.size);
        if (stats.size.includes('/')) {
            const [num, den] = stats.size.split('/').map(Number);
            sizeNum = num / den;
        }

        return {
            name: name,
            type: "creature",
            img: "icons/svg/mystery-man.svg",
            system: {
                description: stats.description ? `<p>${SOTDLUtils.makeDiceRollable(stats.description)}</p>` : "",
                attributes: {
                    strength: { value: stats.strength, modifier: 0, base: stats.strength },
                    agility: { value: stats.agility, modifier: 0, base: stats.agility },
                    intellect: { value: stats.intellect, modifier: 0, base: stats.intellect },
                    will: { value: stats.will, modifier: 0, base: stats.will },
                    perception: { value: stats.perception, modifier: 0, base: stats.perception }
                },
                characteristics: {
                    health: { max: stats.health, value: stats.health, injured: false, healingrate: 0, maxBase: stats.health },
                    defense: stats.defense,
                    size: stats.size,
                    speed: stats.speed,
                    power: stats.power,
                    insanity: { max: stats.insanity, value: 0, immune: false },
                    corruption: { value: stats.corruption, immune: false },
                    defenseBase: stats.defense,
                    powerBase: stats.power,
                    sizeBase: stats.size,
                    speedBase: stats.speed
                },
                difficulty: difficulty,
                difficultyBase: difficulty,
                frightening: stats.frightening,
                horrifying: stats.horrifying,
                descriptor: stats.descriptor,
                perceptionsenses: stats.perceptionsenses,
                speedtraits: stats.speedtraits,
                armor: "",
                roles: []
            },
            prototypeToken: {
                name: name,
                width: sizeNum || 1,
                height: sizeNum || 1,
                texture: { src: "icons/svg/mystery-man.svg" },
                disposition: -1,
                bar1: { attribute: "characteristics.health" }
            },
            items: items,
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }
}

// ===================================================================
// PROGRAMA PRINCIPAL
// ===================================================================
class SOTDLProgram {
    static ensureParseButtonVisible() {
        if (!game.user.isGM && !Actor.canUserCreate(game.user)) {
            return;
        }

        let parseButton = document.getElementById("SOTDL-parse-button");
        if (parseButton != null) {
            return;
        }

        const actorsPanel = document.getElementById("actors");
        const actorFooter = actorsPanel?.getElementsByClassName("directory-footer")[0];
        if (actorFooter) {
            SOTDLUtils.log("Creating SOTDL Parse button.");

            parseButton = document.createElement("button");
            parseButton.innerHTML = `<i id="SOTDL-parse-button" class="fas fa-dragon"></i>Parse SOTDL Content`;
            parseButton.onclick = ev => SOTDLProgram.openParser();

            const createEntityButton = actorFooter.getElementsByClassName("create-entity")[0];
            actorFooter.insertBefore(parseButton, createEntityButton);
        }
    }

    static async openParser(folderId = null) {
        SOTDLUtils.log("Opening SOTDL Parser. Target folder: " + (folderId || "none"));

        const html = `
    <form id="sotdl-input-form">
        <div class="form-group">
            <label>Tipo de Parser:</label>
                <select name="parserType" id="sotdl-parser-type">
                    <option value="creature" selected>Creature Statblock</option>
                    <option value="feature">Features/Rasgos</option>
                    <option value="spell">Spells/Hechizos</option>
                    <option value="talent">Talents/Talentos</option>
                    <option value="weapon">Weapons/Armas (Tabla)</option>
                </select>
        </div>
        <div class="form-group" id="creature-options">
            <label>
                <input type="checkbox" name="cleanTraditions" id="clean-traditions" checked>
                Limpiar Tradiciones (solo Criaturas)
            </label>
        </div>
        <div class="form-group">
            <label id="input-label">Introduce el texto:</label>
            <textarea id="parser-text" rows="15" style="width: 100%; font-family: monospace;"></textarea>
        </div>
    </form>
    `;

        const result = await Dialog.prompt({
            title: "Parse SOTDL Data",
            content: html,
            label: "Parse",
            callback: (html) => {
                return {
                    type: html.find('#sotdl-parser-type').val(),
                    text: html.find('#parser-text').val(),
                    cleanTraditions: html.find('#clean-traditions').prop('checked')
                };
            },


            render: (html) => {
                html.find('#sotdl-parser-type').on('change', function () {
                    const type = $(this).val();
                    const textarea = html.find('#parser-text');
                    const label = html.find('#input-label');
                    const creatureOptions = html.find('#creature-options');

                    if (type === 'creature') {
                        label.text('Introduce el texto de criatura(s):');
                        textarea.attr('placeholder', 'Pega el statblock...');
                        creatureOptions.show();
                    } else if (type === 'feature') {
                        label.text('Introduce los rasgos:');
                        textarea.attr('placeholder', 'Nombre del Rasgo º Descripción\n\nVarios rasgos, uno por línea.');
                        creatureOptions.hide();
                    } else if (type === 'spell') {
                        label.text('Introduce los hechizos:');
                        textarea.attr('placeholder', 'FIREBALL ARCANE ATTACK 3\nDuration Instantaneous\nTarget Point within medium range\nº You hurl a fiery sphere...\n\nPuedes pegar varios hechizos.');
                        creatureOptions.hide();
                    } else if (type === 'talent') {
                        label.text('Introduce los talentos:');
                        textarea.attr('placeholder', 'Formato:\nºº Grupo Opcional\nNombre del Talento º Descripción\n\nPuedes usar ºº para agrupar talents.');
                        creatureOptions.hide();
                    } else if (type === 'weapon') {
                        label.text('Introduce la tabla de armas:');
                        textarea.attr('placeholder', 'Formato:\nNombre Daño Manos Propiedades Precio\n\nEj:\nBow 1d6 Two Ammunition (arrows), range 100 5 ss\nStaff 1d6 Two Finesse 5 cp\nUnarmed 1 Off Finesse -');
                        creatureOptions.hide();
                    }
                });
                html.find('#sotdl-parser-type').trigger('change');
            },



            rejectClose: false
        });

        if (!result || !result.text) {
            return;
        }

        // PARSEAR SEGÚN TIPO
        try {
            if (result.type === 'creature') {
                // === PARSER DE CRIATURAS (TU CÓDIGO ORIGINAL) ===
                const parser = new SOTDLCreatureParser();
                const parseResult = await parser.parseInput(result.text.trim(), result.cleanTraditions);

                if (!parseResult.success) {
                    ui.notifications.error(`Error: ${parseResult.error}`);
                    return;
                }

                if (parseResult.errors.length > 0) {
                    let errorMessage = "Hubo " + parseResult.errors.length + " problema(s):<br/>";
                    for (let error of parseResult.errors) {
                        errorMessage += `${error[0]}: ${error[1]}<br/>`;
                    }
                    ui.notifications.warn(errorMessage, { permanent: true });
                }

                for (const creatureData of parseResult.creatures) {
                    try {
                        SOTDLUtils.log(`Creating actor: ${creatureData.name}`);

                        if (folderId) {
                            creatureData.folder = folderId;
                        }

                        const actor = await Actor.create(creatureData);

                        if (actor) {
                            ui.notifications.info(`Criatura creada: ${actor.name}`);
                        } else {
                            ui.notifications.error(`Error creando: ${creatureData.name}`);
                        }
                    } catch (error) {
                        SOTDLUtils.log(`Error creating actor ${creatureData.name}: ${error.message}`);
                        ui.notifications.error(`Error: ${creatureData.name} - ${error.message}`);
                    }
                }

                ui.notifications.info(`${parseResult.creatures.length} criatura(s) procesada(s)!`);

            } else if (result.type === 'feature') {
                // === PARSER DE FEATURES ===
                const parseResult = FeatureParser.parseText(result.text.trim());

                if (!parseResult.success) {
                    ui.notifications.error(`Error: ${parseResult.error || 'No se pudieron parsear los rasgos'}`);
                    return;
                }

                if (parseResult.errors.length > 0) {
                    let errorMessage = "Hubo " + parseResult.errors.length + " problema(s):<br/>";
                    for (let error of parseResult.errors) {
                        errorMessage += `${error[0]}: ${error[1]}<br/>`;
                    }
                    ui.notifications.warn(errorMessage, { permanent: true });
                }

                for (const itemData of parseResult.items) {
                    try {
                        SOTDLUtils.log(`Creating feature: ${itemData.name}`);

                        if (folderId) {
                            itemData.folder = folderId;
                        }

                        const item = await Item.create(itemData);

                        if (item) {
                            ui.notifications.info(`Rasgo creado: ${item.name}`);
                        }
                    } catch (error) {
                        SOTDLUtils.log(`Error creating feature ${itemData.name}: ${error.message}`);
                        ui.notifications.error(`Error: ${itemData.name} - ${error.message}`);
                    }
                }

                ui.notifications.info(`${parseResult.items.length} rasgo(s) procesado(s)!`);

            } else if (result.type === 'spell') {
                // === PARSER DE SPELLS ===
                const parseResult = SpellParser.parseText(result.text.trim());

                if (!parseResult.success) {
                    ui.notifications.error(`Error: ${parseResult.error || 'No se pudieron parsear los hechizos'}`);
                    return;
                }

                if (parseResult.errors.length > 0) {
                    let errorMessage = "Hubo " + parseResult.errors.length + " problema(s):<br/>";
                    for (let error of parseResult.errors) {
                        errorMessage += `${error[0]}: ${error[1]}<br/>`;
                    }
                    ui.notifications.warn(errorMessage, { permanent: true });
                }

                for (const itemData of parseResult.items) {
                    try {
                        SOTDLUtils.log(`Creating spell: ${itemData.name}`);

                        if (folderId) {
                            itemData.folder = folderId;
                        }

                        const item = await Item.create(itemData);

                        if (item) {
                            ui.notifications.info(`Hechizo creado: ${item.name}`);
                        }
                    } catch (error) {
                        SOTDLUtils.log(`Error creating spell ${itemData.name}: ${error.message}`);
                        ui.notifications.error(`Error: ${itemData.name} - ${error.message}`);
                    }
                }

                ui.notifications.info(`${parseResult.items.length} hechizo(s) procesado(s)!`);
            } else if (result.type === 'talent') {
                // === PARSER DE TALENTS ===
                const parseResult = TalentParser.parseText(result.text.trim());

                if (!parseResult.success) {
                    ui.notifications.error(`Error: ${parseResult.error || 'No se pudieron parsear los talentos'}`);
                    return;
                }

                if (parseResult.errors.length > 0) {
                    let errorMessage = "Hubo " + parseResult.errors.length + " problema(s):<br/>";
                    for (let error of parseResult.errors) {
                        errorMessage += `${error[0]}: ${error[1]}<br/>`;
                    }
                    ui.notifications.warn(errorMessage, { permanent: true });
                }

                for (const itemData of parseResult.items) {
                    try {
                        SOTDLUtils.log(`Creating talent: ${itemData.name}`);

                        if (folderId) {
                            itemData.folder = folderId;
                        }

                        const item = await Item.create(itemData);

                        if (item) {
                            ui.notifications.info(`Talento creado: ${item.name}`);
                        }
                    } catch (error) {
                        SOTDLUtils.log(`Error creating talent ${itemData.name}: ${error.message}`);
                        ui.notifications.error(`Error: ${itemData.name} - ${error.message}`);
                    }
                }

                ui.notifications.info(`${parseResult.items.length} talento(s) procesado(s)!`);
            } else if (result.type === 'weapon') {
                // === PARSER DE WEAPONS ===
                const parseResult = WeaponParser.parseText(result.text.trim());

                if (!parseResult.success) {
                    ui.notifications.error(`Error: ${parseResult.error || 'No se pudieron parsear las armas'}`);
                    return;
                }

                if (parseResult.errors.length > 0) {
                    let errorMessage = "Hubo " + parseResult.errors.length + " problema(s):<br/>";
                    for (let error of parseResult.errors) {
                        errorMessage += `${error[0]}: ${error[1]}<br/>`;
                    }
                    ui.notifications.warn(errorMessage, { permanent: true });
                }

                for (const itemData of parseResult.items) {
                    try {
                        SOTDLUtils.log(`Creating weapon: ${itemData.name}`);

                        if (folderId) {
                            itemData.folder = folderId;
                        }

                        const item = await Item.create(itemData);

                        if (item) {
                            ui.notifications.info(`Arma creada: ${item.name}`);
                        }
                    } catch (error) {
                        SOTDLUtils.log(`Error creating weapon ${itemData.name}: ${error.message}`);
                        ui.notifications.error(`Error: ${itemData.name} - ${error.message}`);
                    }
                }

                ui.notifications.info(`${parseResult.items.length} arma(s) procesada(s)!`);
            }

        } catch (error) {
            SOTDLUtils.log(`Parse error: ${error.message}`);
            ui.notifications.error(`Error: ${error.message}`);
        }
    }
}

// ===================================================================
// HOOKS DE FOUNDRY
// ===================================================================
Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id == "actors") {
        SOTDLProgram.ensureParseButtonVisible();
    }
});

Hooks.on("changeSidebarTab", async (app) => {
    if (app.id == "actors") {
        SOTDLProgram.ensureParseButtonVisible();
    }
});

Hooks.on("renderActorDirectory", async (app, html) => {
    SOTDLProgram.ensureParseButtonVisible();
});

Hooks.on("getActorDirectoryFolderContext", async (html, folderOptions) => {
    folderOptions.push({
        name: "Parse SOTDL Creature",
        icon: '<i class="fas fa-dragon"></i>',
        condition: game.user.isGM,
        callback: header => {
            const li = header.parent();
            SOTDLProgram.openParser(li.data("folderId"));
        }
    });
});

// ===================================================================
// PARSER DE SPELLS/HECHIZOS
// ===================================================================
class SpellParser {
    static parseText(inputText) {
        if (!inputText) {
            return { success: false, error: "No input provided", items: [] };
        }

        const lines = inputText
            .replace(/\r\n|\r/g, '\n')
            .split('\n')
            .map(l => l.replace(/[\u200B-\u200D\uFEFF\s]+/g, ' ').trim())
            .filter(l => l);

        if (lines.length < 1) {
            return { success: false, error: "El texto no puede estar vacío", items: [] };
        }

        // Encontrar inicio de cada spell (línea con nombre en mayúsculas)
        const spellStartIndices = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^[A-Z]+(?:\s+[A-Z]+)*\s+[A-Z]+\s+[A-Z]+\s+\d+$/)) {
                spellStartIndices.push(i);
            }
        }
        spellStartIndices.push(lines.length);

        if (spellStartIndices.length < 2) {
            return { success: false, error: "No se encontraron hechizos válidos", items: [] };
        }

        const items = [];
        const errors = [];

        for (let i = 0; i < spellStartIndices.length - 1; i++) {
            const start = spellStartIndices[i];
            const end = spellStartIndices[i + 1];
            const spellText = lines.slice(start, end).join('\n');

            try {
                const spell = this.parseSpellText(spellText);
                items.push(this.createSpellItem(spell));
            } catch (err) {
                errors.push([lines[start], err.message]);
            }
        }

        return {
            success: items.length > 0,
            items: items,
            errors: errors
        };
    }

    static parseSpellText(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        const headerParts = lines[0].split(/\s+/);
        if (headerParts.length < 4) {
            throw new Error('Encabezado debe tener: NOMBRE tradición tipo rango');
        }

        const rank = parseInt(headerParts[headerParts.length - 1]);
        const spelltype = headerParts[headerParts.length - 2];
        const tradition = headerParts[headerParts.length - 3];
        const name = headerParts.slice(0, headerParts.length - 3).join(' ');

        if (!name.match(/^[A-Z]+(?:\s+[A-Z]+)*$/)) {
            throw new Error('El nombre debe estar en MAYÚSCULAS');
        }
        if (isNaN(rank)) {
            throw new Error('El rango debe ser un número');
        }

        const spell = {
            name: name,
            tradition: tradition,
            spelltype: spelltype,
            rank: rank,
            castingTime: '',
            duration: '',
            range: '',
            target: '',
            area: '',
            requirement: '',
            attackRoll: '',
            resistanceRoll: '',
            effect: '',
            description: '',
            aftereffect: '',
            special: '',
            sacrifice: '',
            permanence: '',
            triggered: '',
            plus20: '',
            heightened: [],
            rawText: text
        };

        let currentSection = null;
        let sectionContent = '';

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const sectionMatch = line.match(/^(Casting Time|Duration|Range|Target|Area|Requirement|Attack Roll|Resistance Roll|Aftereffect|Special|Sacrifice|Permanence|Triggered|Attack Roll 20\+|Heightened|º)\s*:?\s*(.*)/);

            if (sectionMatch) {
                if (currentSection && sectionContent) {
                    this.assignSection(spell, currentSection, sectionContent.trim());
                }
                currentSection = sectionMatch[1];
                sectionContent = sectionMatch[2].trim();
            } else if (currentSection) {
                sectionContent += '\n' + line;
            } else {
                spell.effect += (spell.effect ? '\n' : '') + line;
            }
        }

        if (currentSection && sectionContent) {
            this.assignSection(spell, currentSection, sectionContent.trim());
        }

        return spell;
    }

    static assignSection(spell, section, content) {
        const sec = section.toLowerCase();
        const rollableContent = SOTDLUtils.makeDiceRollable(content);

        if (sec.includes('casting')) {
            spell.castingTime = rollableContent;
        } else if (sec.includes('duration')) {
            spell.duration = rollableContent;
        } else if (sec.includes('range')) {
            spell.range = rollableContent;
        } else if (sec.includes('target')) {
            spell.target = rollableContent;
        } else if (sec.includes('area')) {
            spell.area = rollableContent;
        } else if (sec.includes('requirement')) {
            spell.requirement = rollableContent;
        } else if (sec === 'attack roll') {
            spell.attackRoll = rollableContent;
        } else if (sec === 'resistance roll') {
            spell.resistanceRoll = rollableContent;
        } else if (sec.includes('aftereffect')) {
            spell.aftereffect = rollableContent;
        } else if (sec.includes('special')) {
            spell.special = rollableContent;
        } else if (sec.includes('heightened')) {
            const match = content.match(/\(\+(\d+)\):\s*(.*)/);
            if (match) {
                spell.heightened.push({
                    level: match[1],
                    content: SOTDLUtils.makeDiceRollable(match[2])
                });
            } else {
                spell.heightened.push({
                    level: 0,
                    content: rollableContent
                });
            }
        } else if (sec.includes('sacrifice')) {
            spell.sacrifice = rollableContent;
        } else if (sec.includes('permanence')) {
            spell.permanence = rollableContent;
        } else if (sec.includes('triggered')) {
            spell.triggered = rollableContent;
        } else if (sec.includes('attack roll 20+')) {
            spell.plus20 = rollableContent;
        } else if (sec === 'º') {
            spell.description = content;
        }
    }

    static toTitleCase(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static parseDuration(content) {
        if (!content) return { value: 0, type: '' };
        const match = content.match(/^(\d+)\s+([^.]+)/);
        if (match) {
            return {
                value: parseInt(match[1]),
                type: match[2].trim()
            };
        }
        return {
            value: 0,
            type: content.trim()
        };
    }

    static extractDefense(text) {
        if (!text) return '';
        const match = text.match(/(Strength|Agility|Intellect|Will)/i);
        return match ? match[1] : '';
    }

    static parseAttackRoll(effect) {
        if (!effect) return { attack: '', against: '', damage: '' };
        const match = effect.match(/Make a (\w+) attack roll against the target(?:'s)? (\w+)(?:.*takes (\d+d\d+\s*[+\-]\s*\d+) damage)?/i);
        if (match) {
            return {
                attack: match[1],
                against: match[2],
                damage: match[3] || ''
            };
        }
        return { attack: '', against: '', damage: '' };
    }

    static extractDiceRolls(text) {
        if (!text) return [];
        const diceRegex = /\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\b/g;
        return [...text.matchAll(diceRegex)].map(match => match[1]);
    }

    static extractDamageTypes(text) {
        if (!text) return [];
        const damageTypes = ['acid', 'cold', 'fire', 'electricity', 'force', 'necrotic', 'poison', 'psychic', 'radiant', 'sound', 'physical'];
        const foundTypes = [];
        const textLower = text.toLowerCase();
        for (const type of damageTypes) {
            if (textLower.includes(type) && !foundTypes.includes(type)) {
                foundTypes.push(type);
            }
        }
        return foundTypes;
    }

    static createSpellItem(spell) {
        const now = Date.now();
        const durationParsed = this.parseDuration(spell.duration);
        const attackInfo = this.parseAttackRoll(spell.effect);
        const diceMatch = spell.plus20 ? spell.plus20.match(/(\d+d\d+(?:\s*[+\-]\s*\d+)?)/) : null;
        const plus20damage = diceMatch ? diceMatch[1] : '';

        const diceRolls = this.extractDiceRolls(spell.description);
        const damageTypes = this.extractDamageTypes(spell.description);

        const actionDamage = diceRolls.length > 0 ? diceRolls[0] : (attackInfo.damage || '');
        const actionDamageActive = diceRolls.length > 0 || attackInfo.damage ? true : false;
        const actionDamageType = damageTypes.length > 0 ? damageTypes[0] : '';

        const damagetypes = [];
        const remainingDice = diceRolls.slice(1);
        const remainingTypes = damageTypes.slice(1);
        const maxLength = Math.max(remainingDice.length, remainingTypes.length);

        for (let i = 0; i < maxLength; i++) {
            const dice = remainingDice[i] || '';
            const type = remainingTypes[i] || '';
            if (dice) {
                damagetypes.push({
                    damage: dice,
                    damagetype: type
                });
            }
        }

        return {
            name: spell.name,
            type: 'spell',
            img: 'systems/demonlord/assets/icons/skills/spellbook.webp',
            system: {
                description: `<p>${SOTDLUtils.makeDiceRollable(spell.description)}</p>\n\n<p>—————————</p>\n<p>${spell.rawText}</p>`,
                action: {
                    active: spell.attackRoll || attackInfo.attack ? true : false,
                    against: attackInfo.against || '',
                    damageactive: actionDamageActive,
                    damage: actionDamage,
                    damagetype: actionDamageType,
                    boonsbanesactive: true,
                    boonsbanes: '',
                    plus20active: spell.plus20 ? true : false,
                    plus20: SOTDLUtils.makeDiceRollable(spell.plus20),
                    plus20damage: plus20damage,
                    defense: this.extractDefense(spell.attackRoll),
                    defenseboonsbanes: '',
                    damagetypes: damagetypes,
                    strengthboonsbanesselect: false,
                    agilityboonsbanesselect: false,
                    intellectboonsbanesselect: false,
                    willboonsbanesselect: false,
                    perceptionboonsbanesselect: false,
                    extraboonsbanes: '',
                    extradamage: '',
                    extraplus20damage: '',
                    attack: attackInfo.attack || '',
                    rollbonus: '',
                    extraEffect: '',
                    extraEffect20: ''
                },
                activatedEffect: {
                    activation: {
                        type: spell.castingTime || '',
                        cost: 0
                    },
                    duration: {
                        value: durationParsed.value,
                        type: durationParsed.type
                    },
                    target: {
                        value: spell.area ? (spell.area.match(/(\d+)/)?.[1] || '') : '',
                        type: spell.area ? (spell.area.includes('sphere') ? 'sphere' : spell.area.includes('cube') ? 'cube' : '') : ''
                    },
                    texture: '',
                    range: spell.range || '',
                    uses: {
                        value: 0,
                        max: 0,
                        per: ''
                    }
                },
                tradition: this.toTitleCase(spell.tradition),
                edit: false,
                spelltype: this.toTitleCase(spell.spelltype),
                rank: spell.rank,
                attribute: attackInfo.attack ? attackInfo.attack.toLowerCase() : 'intellect',
                effectdice: '',
                castings: {
                    value: '',
                    max: '',
                    ignoreCalculation: false
                },
                duration: spell.duration,
                target: spell.target,
                area: spell.area,
                requirements: spell.requirement,
                sacrifice: spell.sacrifice,
                permanence: spell.permanence,
                aftereffect: SOTDLUtils.makeDiceRollable(spell.aftereffect),
                special: SOTDLUtils.makeDiceRollable(spell.special),
                triggered: SOTDLUtils.makeDiceRollable(spell.triggered),
                roundsleft: 0,
                healing: {
                    healactive: true,
                    healing: false,
                    rate: ''
                },
                quantity: 1,
                enrichedDescription: `<p>${SOTDLUtils.makeDiceRollable(spell.effect)}</p>`,
                source: ''
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }
}

// ===================================================================
// PARSER DE TALENTS
// ===================================================================
class TalentParser {
    static parseText(inputText) {
        if (!inputText) {
            return { success: false, error: "No input provided", items: [] };
        }

        const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
        const items = [];
        const errors = [];
        let currentItem = '';
        let currentGroup = '';

        for (let line of lines) {
            if (line.startsWith('ºº')) {
                // Procesar item anterior si existe
                if (currentItem) {
                    try {
                        const parts = currentItem.split(SEPARATOR);
                        const name = parts[0].trim();
                        const description = parts.slice(1).join(SEPARATOR).trim();
                        if (name) {
                            items.push(this.createTalent(name, description, currentGroup));
                        }
                    } catch (error) {
                        errors.push(['Talent', error.message]);
                    }
                    currentItem = '';
                }
                // Nuevo grupo
                currentGroup = line.replace(/^ºº/, '').trim();
            } else if (line.includes(SEPARATOR)) {
                // Procesar item anterior si existe
                if (currentItem) {
                    try {
                        const parts = currentItem.split(SEPARATOR);
                        const name = parts[0].trim();
                        const description = parts.slice(1).join(SEPARATOR).trim();
                        if (name) {
                            items.push(this.createTalent(name, description, currentGroup));
                        }
                    } catch (error) {
                        errors.push(['Talent', error.message]);
                    }
                }
                currentItem = line;
            } else if (currentItem) {
                currentItem += ' ' + line;
            }
        }

        // Procesar último item
        if (currentItem) {
            try {
                const parts = currentItem.split(SEPARATOR);
                const name = parts[0].trim();
                const description = parts.slice(1).join(SEPARATOR).trim();
                if (name) {
                    items.push(this.createTalent(name, description, currentGroup));
                }
            } catch (error) {
                errors.push(['Talent', error.message]);
            }
        }

        return {
            success: items.length > 0,
            items: items,
            errors: errors
        };
    }

    static createTalent(name, description, groupname) {
        const now = Date.now();
        return {
            name: name,
            type: "talent",
            img: "systems/demonlord/assets/icons/skills/fist.webp",
            system: {
                description: `<p>${SOTDLUtils.makeDiceRollable(description)}</p>`,
                action: {
                    active: true,
                    against: "",
                    damageactive: true,
                    damage: "",
                    damagetype: "",
                    boonsbanesactive: true,
                    boonsbanes: "",
                    plus20active: true,
                    plus20: "",
                    plus20damage: "",
                    defense: "",
                    defenseboonsbanes: "",
                    damagetypes: [],
                    strengthboonsbanesselect: false,
                    agilityboonsbanesselect: false,
                    intellectboonsbanesselect: false,
                    willboonsbanesselect: false,
                    perceptionboonsbanesselect: false,
                    extraboonsbanes: "",
                    extradamage: "",
                    extraplus20damage: "",
                    attack: "",
                    rollbonus: "",
                    extraEffect: "",
                    extraEffect20: ""
                },
                activatedEffect: {
                    activation: { type: "", cost: 0 },
                    duration: { value: 0, type: "" },
                    target: { value: "", type: "" },
                    texture: "",
                    range: "",
                    uses: { value: 0, max: 0, per: "" }
                },
                addtonextroll: true,
                multipleoptions: false,
                uses: { value: "", max: "" },
                challenge: {
                    active: true,
                    attribute: "",
                    boonsbanesactive: true,
                    boonsbanesselect: "",
                    boonsbanes: "",
                    strengthboonsbanesselect: false,
                    agilityboonsbanesselect: false,
                    intellectboonsbanesselect: false,
                    willboonsbanesselect: false,
                    perceptionboonsbanesselect: false
                },
                healing: {
                    healactive: true,
                    healing: false,
                    rate: ""
                },
                damage: "",
                damagetype: "",
                bonuses: {
                    defenseactive: true,
                    defense: "",
                    healthactive: true,
                    health: "",
                    speedactive: true,
                    speed: "",
                    poweractive: true,
                    power: ""
                },
                groupname: groupname || "",
                isActive: false,
                source: "",
                enrichedDescription: ""
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }
}

// ===================================================================
// PARSER DE WEAPONS (desde tabla)
// ===================================================================
class WeaponParser {
    static parseText(inputText) {
        if (!inputText) {
            return { success: false, error: "No input provided", items: [] };
        }

        const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
        const weapons = [];
        const errors = [];

        lines.forEach(line => {
            try {
                // Extraer precio del final
                const priceMatch = line.match(/\s+(\d+\s*(?:cp|ss|gc|gp|sp|bp)|−|-|—)\s*$/i);
                let price = priceMatch ? priceMatch[1].trim() : '';
                if (price === '-' || price === '−' || price === '—') {
                    price = '';
                }
                const remaining = priceMatch ? line.substring(0, line.lastIndexOf(priceMatch[1])).trim() : line;

                // Buscar hands: One, Two, Off, -
                const handsPattern = /\b(One|Two|Off|−|-)\b/i;
                const handsMatch = remaining.match(handsPattern);

                if (!handsMatch) {
                    errors.push([line, 'No se encontró indicador de manos (One/Two/Off/-)']);
                    return;
                }

                const handsIndex = remaining.indexOf(handsMatch[0]);
                const beforeHands = remaining.substring(0, handsIndex).trim();
                const hands = handsMatch[1];
                const properties = remaining.substring(handsIndex + hands.length).trim();

                // Extraer daño (patrón de dados)
                const dicePattern = /(\d+d\d+(?:\s*[+\-]\s*\d+)?(?:\s+\w+)?)/i;
                const diceMatch = beforeHands.match(dicePattern);

                if (!diceMatch) {
                    errors.push([line, 'No se encontró patrón de daño válido']);
                    return;
                }

                const damage = diceMatch[1].trim();
                const diceIndex = beforeHands.lastIndexOf(damage);
                const name = beforeHands.substring(0, diceIndex).trim();

                if (!name || !damage) {
                    errors.push([line, 'Nombre o daño inválido']);
                    return;
                }

                const weaponData = {
                    name: name,
                    damage: damage,
                    hands: hands,
                    properties: properties,
                    price: price
                };

                const weapon = this.createWeapon(weaponData);
                if (weapon) {
                    weapons.push(weapon);
                }
            } catch (error) {
                errors.push([line, error.message]);
            }
        });

        return {
            success: weapons.length > 0,
            items: weapons,
            errors: errors
        };
    }

    static extractRange(properties) {
        const rangeMatch = properties.match(/range\s+(\d+)/i);
        return rangeMatch ? rangeMatch[1] : '';
    }

    static createWeapon(weaponData) {
        const now = Date.now();
        const name = weaponData.name.trim();
        const damage = weaponData.damage.trim();
        const hands = weaponData.hands.trim();
        let properties = weaponData.properties.trim();

        // Normalizar hands
        let handsValue = '';
        if (hands.toLowerCase() === 'one') {
            handsValue = 'one';
        } else if (hands.toLowerCase() === 'two') {
            handsValue = 'two';
        } else if (hands.toLowerCase() === 'off') {
            handsValue = 'off';
        }

        // Detectar munición
        const hasAmmunition = /ammunition\s*\(/i.test(properties);

        // Detectar contra qué atributo
        const targetsAgility = /targets\s+agility/i.test(properties);
        const against = targetsAgility ? 'Agility' : 'Defense';

        // Extraer rango
        const range = this.extractRange(properties);

        // Determinar tipo
        const isRanged = /range\s+\d+/i.test(properties);
        const weaponType = isRanged ? 'Ranged' : 'Melee';

        // Agregar tipo al inicio de properties
        if (!properties.startsWith('Ranged') && !properties.startsWith('Melee')) {
            properties = weaponType + ', ' + properties;
        }

        return {
            name: name,
            type: "weapon",
            img: isRanged ?
                "systems/demonlord/assets/icons/weapons/rifle.webp" :
                "systems/demonlord/assets/icons/weapons/fist.webp",
            system: {
                description: "",
                action: {
                    active: true,
                    against: against,
                    damageactive: true,
                    damage: damage,
                    damagetype: "",
                    boonsbanesactive: false,
                    boonsbanes: "",
                    plus20active: true,
                    plus20: "",
                    plus20damage: "",
                    defense: "",
                    defenseboonsbanes: "",
                    damagetypes: [],
                    strengthboonsbanesselect: false,
                    agilityboonsbanesselect: false,
                    intellectboonsbanesselect: false,
                    willboonsbanesselect: false,
                    perceptionboonsbanesselect: false,
                    extraboonsbanes: "",
                    extradamage: "",
                    extraplus20damage: "",
                    attack: isRanged ? "Agility" : "Strength",
                    rollbonus: "",
                    extraEffect: "",
                    extraEffect20: ""
                },
                activatedEffect: {
                    activation: { type: "", cost: 0 },
                    duration: { value: 0, type: "" },
                    target: { value: "", type: "" },
                    texture: "",
                    range: range,
                    uses: { value: 0, max: 0, per: "" }
                },
                hands: handsValue,
                properties: properties,
                requirement: {
                    attribute: "",
                    minvalue: 0
                },
                wear: true,
                quantity: 1,
                availability: "",
                value: weaponData.price || "",
                source: "",
                enrichedDescription: "",
                consume: {
                    ammorequired: hasAmmunition,
                    amount: 1,
                    ammoitemid: ""
                }
            },
            effects: [],
            flags: {},
            _id: SOTDLUtils.generateId(),
            _stats: { createdTime: now, modifiedTime: now }
        };
    }
}

Hooks.on("ready", function () {
    SOTDLUtils.log("SOTDL Creature Parser initialized.");
});