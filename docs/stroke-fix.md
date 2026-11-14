# Keeping "stroke" when the engine said no

*How Family Zoo kept STROKE as a way to pet the animals when it moved to Sharpee 5.6.1
(Chord 4.0.2), in plain language. Ticket: [#14](https://github.com/Johnesco/familyzoo/issues/14).*

## The short version

Step 13 of the tutorial teaches you to invent a new verb. The zoo invents **petting** and
lets the player say it two ways: PET THE GOATS or STROKE THE GOATS. The new engine
release refused the second one, because the engine already uses "stroke" for something
else. We fixed it by telling the engine, in three lines, to let go of the word so petting
could have it. STROKE now works exactly as it did before.

## Some background: who owns a word

Typing a command like STROKE THE RABBITS doesn't run code tied to the word directly. The
engine first works out which **action** the sentence belongs to, and then runs that
action. Each action comes with a list of sentence shapes it answers to, called its
**grammar**.

Sharpee ships with a set of standard actions that every game gets for free: taking,
dropping, opening, touching, and so on. The standard **touching** action already answers
to TOUCH, FEEL, RUB and STROKE. In the real world, stroking something is a way of
touching it.

In step 13, the zoo adds an action of its own:

```chord
define action petting
  grammar
    pet the animal
    stroke the animal
  the animal must be reachable
  refuse without animal: cant-pet
  otherwise refuse cant-pet
```

That gives two actions claiming the word "stroke". Up to engine 5.5.0, the story's own
claim quietly won. STROKE THE RABBITS ran petting, and nobody noticed the overlap:

```
> stroke rabbits
You pet the animal. It seems pleased.

You gently stroke one of the rabbits. Its fur is incredibly soft. It twitches its nose at you contentedly.
```

## What changed in 5.6.1

The new release stops the quiet takeover. If a story's action uses a sentence shape that
a standard action already owns, the story no longer compiles. The engine reports:

```
familyzoo.story:565:1 error [analysis.repeats-standard-grammar] `stroke :animal` is
already the standard `touching` grammar, so this action would take that command from it.
To give a thing its own response, write `on the player touching` in that thing's block
or its trait's. To add new wording, use `extend action touching`. To replace the
standard action, first remove its shape with `remove from action touching`.
```

This is a good change. Taking a word silently is the kind of thing that surprises an
author months later ("why does STROKE THE CAT do something odd?"). Now the overlap has
to be stated on purpose.

It affected only the steps that contain petting: v13, v14, v15, v16 and the finished
zoo. Steps v01–v12 just needed the version number changed.

## The fix we chose

The error lists three ways out. The last one does exactly what step 13 intended, so we
used it. Just above the petting action we added:

```chord
remove from action touching
  stroke the thing
```

Read it as: *"Standard touching action, please stop answering to STROKE <something>."*
With the word given up, petting can keep its own line, `stroke the animal`, and the
engine is satisfied. Nothing else in the story changed.

What the player sees now:

```
> stroke rabbits
You gently stroke one of the rabbits. Its fur is incredibly soft. It twitches its nose at you contentedly.

> stroke hay bale
You can't pet that.

> touch rabbits
The rabbits are solid and immovable.
```

STROKE behaves exactly like PET. Stroking something that isn't an animal gets the
petting action's own refusal. TOUCH, FEEL and RUB still belong to the standard touching
action and behave as before.

### Why this one

- **STROKE *is* petting, not something that resembles it.** Anything in the story that
  listens for petting also hears STROKE. That includes the goats' and rabbits'
  after-hours confessions, which are written as `after the player petting`.
- **It keeps step 13's single idea.** That step shows how verbs can be customized:
  invent a new one, and decide which words mean it. Taking a word back from a standard
  verb is part of the same idea, not a second lesson. The step's README mentions the
  line next to the petting bullet.
- **It's small and honest.** Three lines, and anyone reading the story can see the word
  was moved on purpose.

## Other ways we could have gone

### 1. Drop "stroke" from petting

Delete the one line `stroke the animal` and say nothing else. It compiles, but STROKE
then falls back to the standard touching action:

```
> stroke rabbits
The rabbits are solid and immovable.
```

This is the smallest possible change, but it breaks what the step promises, and
"solid and immovable" is a strange thing to read about a rabbit. We rejected it because
the point of the step was to add a verb.

### 2. Teach the animals to answer "touching"

This is the error message's first suggestion. Leave STROKE with the touching action, and
give the `pettable` trait a reply for it:

```chord
define trait pettable
  ...
  on the player touching
    phrase petted
  end on
end trait
```

We built and tested this one. STROKE and TOUCH then both give each animal's petting
reply:

```
> stroke rabbits
You gently stroke one of the rabbits. Its fur is incredibly soft. It twitches its nose at you contentedly.

> touch goats
You reach down and pet the nearest goat. It leans into your hand and bleats happily. The others crowd around, demanding equal attention.
```

It has three catches:
- STROKE isn't really petting any more, it's touching dressed up as petting. The
  confessions listen for *petting*, so stroking the goats after hours wouldn't trigger
  theirs. Only PET would.
- TOUCH now pets the animals too, which nobody asked for.
- It teaches a second idea in step 13: a trait answering one of the engine's own verbs.

### 3. Pick a word nobody owns

Swap STROKE for a word the engine has no action for, such as CUDDLE:

```chord
define action petting
  grammar
    pet the animal
    cuddle the animal
```

It compiles cleanly and works:

```
> cuddle rabbits
You gently stroke one of the rabbits. Its fur is incredibly soft. It twitches its nose at you contentedly.
```

But it dodges the problem rather than solving it, and players are more likely to type
STROKE than CUDDLE. Worth remembering: a brand-new verb never runs into this rule at all.

### 4. Add the wording to touching instead

The error's middle suggestion, `extend action touching`, adds new *wording* to the
standard touching action, such as making CARESS mean touch. That's the wrong direction
for us. We wanted STROKE to mean petting, not more ways to say touch.

### 5. Stay on the old engine

We could have left the zoo on 5.5.0. The tutorial would keep teaching something the
current engine refuses, so anyone copying step 13 into a new game would hit this error
straight away.

## One more change the update brought

The new engine also fixed the message for switching on a light. In the Supply Room,
which is already lit, the old engine said:

```
> turn on flashlight
The flashlight switches on, banishing the darkness.
```

There was no darkness to banish. 5.6.1 checks whether the room is actually dark, so in
a lit room it now says:

```
> turn on flashlight
You switch on the flashlight.
```

In the dark Nocturnal Animals Exhibit, the important case for step 8 (Light & Dark), it
still says "banishing the darkness" and lights up the room. The saved walkthrough
transcripts for v08–v16 and the finished zoo were updated to match. No story code
changed for this.

## Also removed: two `emit` lines

Petting and feeding used to print two messages: a generic one, and then the animal's
own. After the parrot bit you, the game still said "It seems pleased":

```
> pet parrot
You pet the animal. It seems pleased.

You reach toward the parrot. CHOMP! It nips your finger with its beak. "NO TOUCHING!" it squawks indignantly.
```

The generic line came from `emit`:

```chord
on the player petting
  emit petted       ← announces a "petted" event and prints the trait's generic text
  phrase petted     ← prints the animal's own text
end on
```

`emit` is for announcing an event that other parts of a story react to. Nothing in the
zoo reacts to "petted" or "fed", and no step teaches events, so the line's only visible
effect was the duplicate message. We deleted `emit petted` and `emit fed` in v13–v16 and
the finished zoo. Each verb now says one thing. The quotes above already show the
single-message output.

Events deserve a step of their own, where something visibly reacts to one.
