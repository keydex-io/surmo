import { type Game } from "../../game";

import { DeathMarker } from "../../objects/deathMarker";
import { explosion } from "../../objects/explosion";
import { Player } from "../../objects/player";
import { Obstacle } from "../../objects/obstacle";

import { ReceivingPacket } from "../../types/receivingPacket";
import { type GameObject } from "../../types/gameObject";

import { type SuroiBitStream } from "../../../../../common/src/utils/suroiBitStream";
import { type ObjectType } from "../../../../../common/src/utils/objectType";
import { ObjectCategory } from "../../../../../common/src/constants";
import { type GunDefinition } from "../../../../../common/src/definitions/guns";

export class UpdatePacket extends ReceivingPacket {
    override deserialize(stream: SuroiBitStream): void {
        const player: Player = this.playerManager.game.activePlayer;
        if (player === undefined) return;

        const game: Game = player.game;

        const playerManager = game.playerManager;

        const scene = player.scene;

        //
        // Active player data
        //

        // Health
        if (stream.readBoolean()) {
            playerManager.health = stream.readFloat(0, 100, 8);
            let roundedHealth = Math.round(playerManager.health);
            //This doesn't get set to the exact number because the stream has trouble reading it correctly.
            if (playerManager.health < 1 && playerManager.health > 0) { roundedHealth = 1; }
            const healthPercentage = `${roundedHealth}%`;
            $("#health-bar").width(healthPercentage);
            $("#health-bar-animation").width(healthPercentage);
            $("#health-bar-percentage").text(playerManager.health < 1 && playerManager.health > 0 ? "< 1" : roundedHealth);
            if (playerManager.health < 60 && playerManager.health > 10) {
                $("#health-bar").css("background-color", `rgb(255, ${(playerManager.health - 10) * 4}, ${(playerManager.health - 10) * 4})`);
            } else if (playerManager.health <= 10) {
                $("#health-bar").css("background-color", `rgb(${playerManager.health * 15 + 105}, 0, 0)`);
            } else {
                $("#health-bar").css("background-color", "#f8f9fa");
            }
        }

        // Adrenaline
        if (stream.readBoolean()) {
            playerManager.adrenaline = stream.readFloat(0, 100, 8);
        }

        // Active player ID
        if (stream.readBoolean()) {
            const noID: boolean = game.activePlayer.id === undefined;
            game.activePlayer.id = stream.readUint16();
            if (noID) {
                game.objects.set(game.activePlayer.id, game.activePlayer);
            }
        }

        // Inventory
        playerManager.deserializeInventory(stream);

        //
        // Objects
        //

        // Full objects
        if (stream.readBoolean()) {
            const fullObjectCount: number = stream.readUint8();
            for (let i = 0; i < fullObjectCount; i++) {
                const type = stream.readObjectType();
                const id = stream.readUint16();
                let object: GameObject | undefined;

                if (!game.objects.has(id)) {
                    switch (type.category) {
                        case ObjectCategory.Player: {
                            object = new Player(game, scene, type as ObjectType<ObjectCategory.Player>, id);
                            break;
                        }
                        case ObjectCategory.Obstacle: {
                            object = new Obstacle(game, scene, type as ObjectType<ObjectCategory.Obstacle>, id);
                            break;
                        }
                        case ObjectCategory.DeathMarker: {
                            object = new DeathMarker(game, scene, type, id);
                            break;
                        }
                    }

                    if (object === undefined) {
                        console.warn(`Unknown object category: ${type.category}`);
                        continue;
                    }

                    game.objects.set(object.id, object);
                } else {
                    const objectFromSet: GameObject | undefined = game.objects.get(id);
                    if (objectFromSet === undefined) {
                        console.warn(`Could not find object with ID ${id}`);
                        continue;
                    }
                    object = objectFromSet;
                }

                object.deserializePartial(stream);
                object.deserializeFull(stream);
            }
        }

        // Partial objects
        if (stream.readBoolean()) {
            const partialObjectCount: number = stream.readUint8();
            for (let i = 0; i < partialObjectCount; i++) {
                const id: number = stream.readUint16();
                const object: GameObject | undefined = game.objects.get(id);
                if (object === undefined) {
                    console.warn(`Unknown partial object with ID ${id}`);
                    continue;
                }
                object.deserializePartial(stream);
            }
        }

        // Deleted objects
        if (stream.readBoolean()) {
            const deletedObjectCount: number = stream.readUint8();
            for (let i = 0; i < deletedObjectCount; i++) {
                const id: number = stream.readUint16();
                const object: GameObject | undefined = game.objects.get(id);
                if (object === undefined) {
                    console.warn(`Trying to delete unknown object with ID ${id}`);
                    continue;
                }
                object.destroy();
                game.objects.delete(id);
            }
        }

        // Bullets
        if (stream.readBoolean()) {
            const bulletCount: number = stream.readUint8();
            for (let i = 0; i < bulletCount; i++) {
                const id: number = stream.readUint8();
                const bulletSourceDef = stream.readObjectTypeNoCategory(ObjectCategory.Loot).definition as GunDefinition;
                const initialPosition = stream.readPosition();
                const finalPosition = stream.readPosition();

                // Play firing sound
                if (Phaser.Math.Distance.BetweenPoints(player.position, initialPosition) < 50) {
                    player.scene.playSound(`${bulletSourceDef.idString}_fire`);
                }

                // Spawn bullet
                const bullet = player.scene.add.image(
                    initialPosition.x * 20,
                    initialPosition.y * 20,
                    "main",
                    `${bulletSourceDef.idString}_trail.svg`
                ).setRotation(Phaser.Math.Angle.BetweenPoints(initialPosition, finalPosition));
                game.bullets.set(id, bullet);
                player.scene.tweens.add({
                    targets: bullet,
                    x: finalPosition.x * 20,
                    y: finalPosition.y * 20,
                    alpha: 0,
                    duration: 500,
                    onComplete: (): void => {
                        bullet.destroy(true);
                    }
                });
            }
        }

        // Deleted bullets
        if (stream.readBoolean()) {
            const destroyedBulletCount: number = stream.readUint8();
            for (let i = 0; i < destroyedBulletCount; i++) {
                const bulletID = stream.readUint8();
                const bullet: Phaser.GameObjects.Image | undefined = game.bullets.get(bulletID);
                if (bullet === undefined) {
                    console.warn(`Could not find bullet with ID ${bulletID}`);
                    continue;
                }
                bullet.destroy(true);
                game.bullets.delete(bulletID);
            }
        }

        // Explosions
        if (stream.readBoolean()) {
            const explosionCount = stream.readUint8();
            for (let i = 0; i < explosionCount; i++) {
                explosion(game,
                    game.activePlayer.scene,
                    stream.readObjectType() as ObjectType<ObjectCategory.Explosion>,
                    stream.readPosition());
            }
        }

        // Alive count
        if (stream.readBoolean()) {
            const aliveCount = stream.readBits(7);
            $("#ui-players-alive").text(aliveCount);
        }
    }
}
