# Version 3: Scenery

## What This Version Does

The zoo feels more alive now. Every area has things to look at — iron fences, flower beds, hay bales, rabbits, parrots, waterfalls, rope perches. You can examine all of them, but you can't pick any of them up. They're part of the environment.

## What's New (Compared to V2)

V2 had a few scenery objects (sign, booth, goats, toucan). V3 fills out the world with scenery in every room, and explains the SceneryTrait in detail.

## What You'll Learn

### SceneryTrait

SceneryTrait is one of the simplest traits, but it's one you'll use constantly. It does exactly one thing: **prevents the player from taking the entity.**

```typescript
const fence = world.createEntity('iron fence', EntityType.OBJECT);
fence.add(new IdentityTrait({
  name: 'iron fence',
  description: 'A tall wrought-iron fence with animal silhouettes.',
  aliases: ['fence', 'iron fence', 'railing'],
}));
fence.add(new SceneryTrait());
world.moveEntity(fence.id, entrance.id);
```

When the player types `take fence`, they'll see: *"iron fence is fixed in place."*

But `examine fence` still works — SceneryTrait doesn't block examining. The entity still has an IdentityTrait with a description.

### Why Scenery Matters

In Sharpee, **all objects are portable by default.** If you create an `EntityType.OBJECT` with IdentityTrait and nothing else, the player can pick it up, carry it around, and drop it wherever they want.

That's usually not what you want for environmental objects. You don't want the player stuffing a park bench into their backpack. `SceneryTrait` is how you say "this is part of the world, not a collectible."

### EntityType.OBJECT + SceneryTrait

Scenery uses the same generic `EntityType.OBJECT` as portable items. It's the **trait** that makes the difference:

- **`EntityType.OBJECT`** is the general-purpose entity type for things in the world. By itself, it's portable.
- **`SceneryTrait`** is the mechanism that blocks the taking action and marks the entity as fixed in place.

The entity type is just a hint — `SceneryTrait` is what does the real work.

### When to Use SceneryTrait

| Use SceneryTrait | Don't Use SceneryTrait |
|-----------------|----------------------|
| Fences, walls, gates | Maps, keys, coins |
| Animals in enclosures | Food, tools, equipment |
| Trees, rocks, waterfalls | Letters, books, notes |
| Benches, signs, posts | Bags, boxes, containers |
| Architectural features | Anything the player should carry |

The rule of thumb: if you'd find it strange for the player to put it in their pocket, it's scenery.

### Aliases Make Scenery Discoverable

Scenery objects should have generous aliases so the player can refer to them naturally:

```typescript
aliases: ['fence', 'iron fence', 'wrought-iron fence', 'railing'],
```

If the room description mentions "a wrought-iron fence," the player might type `examine wrought-iron fence`, `examine fence`, or `examine railing`. All of those should work. Aliases make that happen.

## Commands to Try

```
> look                  See the room with all its scenery
> examine fence         Look at the iron fence
> take fence            "iron fence is fixed in place."
> south                 Go to the Main Path
> examine flowers       Look at the flower beds
> examine bench         Look at the park bench
> east                  Go to the Petting Zoo
> examine hay bale      Look at the hay bale
> examine rabbits       Look at the rabbits
> west; west            Go to the Aviary
> examine parrots       Look at the parrots
> examine waterfall     Look at the waterfall
> examine perches       Look at the rope perches
```

## The Code

See `src/v03.ts` for the complete, commented source.

## Key Takeaway

SceneryTrait prevents taking. Without it, everything is portable by default. Use SceneryTrait for anything that's part of the environment — and give it plenty of aliases so the player can find it naturally.
