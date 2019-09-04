window.onload = function () {
    Vue.component("controllers_fight", {
        props: ["triggerFight", "triggerRest"],
        template: ``
    })

    var battleScene = new Vue({
        el: "#board",
        data: {
            fight: false,
            loading: false,
            logs: ["Vous êtes à la taverne"],
            player: {
                image: "img/wizard.png",
                level: 1,
                experience: 0,
                gold: 0,
                points: 0,
                stats: {
                    max_life: 20,
                    life: 20,
                    max_mana: 10,
                    mana: 10,
                    strength: 4,
                    defense: 2
                },
                isDead: false
            },
            encounter: {},
            enemy: {
                list: [{
                    name: "Wolf",
                    image: "img/wolf.png",
                    stats: {
                        max_life: 20,
                        strength: 4,
                        defense: 2,
                        reward: {
                            experience: 8,
                            gold: 3
                        }
                    }
                }, {
                    name: "Boar",
                    image: "img/boar.png",
                    stats: {
                        max_life: 12,
                        strength: 3,
                        defense: 1,
                        reward: {
                            experience: 6,
                            gold: 2
                        }
                    }
                }]
            },
            levelGrid: [20, 40, 80, 140, 220, 320, 500]
        },
        methods: {
            addToLog(message) {
                this.logs.unshift(message)
            },
            initFight() {
                this.encounter = this.enemy.list[Math.floor(Math.random() * this.enemy.list.length)]
                this.encounter.stats.life = this.encounter.stats.max_life
            },
            triggerFight() {
                this.initFight()
                this.fight = true
                this.addToLog(`Vous vous aventurez dans le donjon et rencontrez ${this.encounter.name}`)
            },
            triggerRest() {
                this.player.stats.life = this.player.stats.max_life
                this.player.stats.mana = this.player.stats.max_mana
                this.addToLog("Vous vous reposez et vous sentez revigoré")
            },
            rollAttackEffectiveness() {
                const rollAttack = Math.random() * 100
                if (rollAttack < 20) {
                    return false
                } else if (rollAttack > 95) {
                    return "crit"
                } else {
                    return true
                }
            },
            attackEnemy() {
                if (this.loading) { return } else {
                    this.loading = true
                    const attack = this.rollAttackEffectiveness()
                    if (attack === "crit") {
                        this.encounter.stats.life = this.encounter.stats.life - (this.player.stats.strength - this.encounter.stats.defense) * 2
                        this.addToLog(`COUP CRITIQUE ! Vous infligez ${(this.player.stats.strength - this.encounter.stats.defense) * 2} dégats à ${this.encounter.name}`)
                    } else if (attack) {
                        this.encounter.stats.life = this.encounter.stats.life - (this.player.stats.strength - this.encounter.stats.defense)
                        this.addToLog(`Vous infligez ${this.player.stats.strength - this.encounter.stats.defense} dégats à ${this.encounter.name}`)
                    } else {
                        this.addToLog(`Vous ratez ${this.encounter.name}`)
                    }
                    setTimeout(() => this.resolveTurn(), 1000)
                }


            },
            resolveTurn() {
                if (this.encounter.stats.life < 1) {
                    this.fight = false
                    this.player.experience += this.encounter.stats.reward.experience
                    this.player.gold += this.encounter.stats.reward.gold
                    this.addToLog(`Vous triomphez de ${this.encounter.name} et remportez ${this.encounter.stats.reward.experience} points d'expérience et ${this.encounter.stats.reward.gold} pièces d'or`)
                    this.isLevelUp()
                } else {
                    this.enemyAttack()
                }
                this.loading = false
            },
            enemyAttack() {
                const attack = this.rollAttackEffectiveness()
                if (attack === "crit") {
                    this.player.stats.life = this.player.stats.life - (this.encounter.stats.strength - this.player.stats.defense) * 2
                    this.addToLog(`COUP CRITIQUE ! ${this.encounter.name} vous inflige ${(this.encounter.stats.strength - this.player.stats.defense) * 2} dégats`)
                } else if (attack) {
                    this.player.stats.life = this.player.stats.life - (this.encounter.stats.strength - this.player.stats.defense)
                    this.addToLog(`${this.encounter.name} vous inflige ${this.encounter.stats.strength - this.player.stats.defense} dégats`)
                } else {
                    this.addToLog(`${this.encounter.name} vous rate`)
                }

                if (this.player.stats.life < 1) {
                    this.player.isDead = true
                }
            },
            useFireball() {
                if (this.loading) {
                    return
                } else {
                    if (this.player.stats.mana >= 4) {
                        this.loading = true
                        this.player.stats.mana -= 4
                        this.encounter.stats.life -= 6
                        this.addToLog(`Vous lancez une boule de feu qui inflige 6 dégats à ${this.encounter.name}`)
                        setTimeout(() => this.resolveTurn(), 1000)
                    }
                }

            },
            isLevelUp() {
                if (this.player.experience >= this.levelGrid[this.player.level - 1]) {
                    this.player.experience = 0
                    this.player.level++
                    this.player.points += 5
                    this.addToLog(`Vous êtes passé au niveau ${this.player.level}`)
                }
            },
            attributePoint(stat) {
                this.player.points--
                this.player.stats[stat]++
            },
            attemptToRun() {
                if (this.loading) {
                    return
                } else {
                    this.loading = true
                    const isSuccessful = Math.random() * 10 < 1 ? true : false
                    if (isSuccessful) {
                        this.addToLog('Vous prenez la fuite')
                        setTimeout(() => { this.fight = false }, 1000)
                    } else {
                        this.addToLog('Vous essayez de prendre la suite mais échouez')
                        setTimeout(() => this.resolveTurn(), 1000)
                    }
                }

            }
        }
    })
}
