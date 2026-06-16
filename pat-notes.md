ux
- sidebar? sidebar must stay?
- work in light mode first
- go figma


on the glass buttons, can we make a subtle scale effect on hover? smaller than when you click.
and can we also add nice color fill hover animation on all the contentarea buttons as well? maybe like, a white-04 or black-04 depending on theme?

oh shit we should probably push on this branch lol. but no PR yet pelase.


activity list items should have dynamic time stamps, like Just now, 1m ago, 2m ago, etc 1h ago, 1d etc

so the transactions list, i when it's populated, i want the container to go off screen... and the button wrapper should have progressive blur mask like we do on the face ID behind it. know what i mean? feel free to ask me questions because i'm sure i missed some edge cases

also hold up, so ours has a separate mode for when it's round? is that how aave does it? because i can play with their slider demo and make the width and height match and i get the good circular feel. what's going on here. we should try to match them as closely as we can

Batch
in the tap to pay flow, the debit card jumps right before the faceID appears
the terms of service and privacy policy caption text, we need the ampersands to not have the different style, i think it should be text secondary
when the card is being created, can you move its position up 24px, along with the creating card?

MAYBE:
can we make the debit card, instead of the line, have the glass specular outline? we'd need to apply the glass to it... is that possible? or does it mess with out smooth animation, because i think we keep the same card moving through each beat.

add funds prompt:
ok lets work on add withdraw, they are sibling flows so i think we will be able to reuse.

so tap on add button, a sheet opens up https://www.figma.com/design/vfkXWw3wcsGzhCq5a0LUhr/Bitcoin-2026?node-id=109-29870&t=at3eqjOm9zHBcqXO-11

next screen is like this , in the same sheet transition right to left. the content is like this https://www.figma.com/design/ZbDM0ipAu5qTluiHz9r2KX/Grid?node-id=2143-39402&t=5mqeOvOqf8qYKm8u-11 but there is a custom keypad (should be able to type numbers here as well as clicking the keypad) and a button at the bottom to continue. here's the shape in a screenshot, sorry i don't have the full figma. /Users/patcapulong/Downloads/IMG_0428.PNG

next screen is like this https://www.figma.com/design/ZbDM0ipAu5qTluiHz9r2KX/Grid?node-id=2143-38851&t=5mqeOvOqf8qYKm8u-11 there's a faceID symbol in the CTA, we'll have to do the extraction from SF Pro, find the name/code from plist, export to svg at semibold weight

button shows a loading spinner at the same time FaceIDAuth plays, after the faceID animation plays, the sheet dismisses and a new item is added to activity list.

any assets you might need might be in /Users/patcapulong/Development/Projects/grid-api/components/grid-wallet-demo/refs/xcassets

feel free to ask me questions, lmk if i missed anything


---
okay we should make a toast component. it should be a glass pill.
so when you add money, it's like $1,500 added to balance. withdraw it's like the same but withdrawn from balance
no icons just text. use iOS styles we have. animates from the top.
i also need it to trigger when you try to Tap to Pay when there's not enough balance!
also debit card activity should be in the home activity list as well.

---


LATER:
add ability to change countries on bank 


when you tap the notification or click the input fields it should autofill. but it should autofill much faster than it does now
once its filled it should make CTA have spinner for 500ms then go to check mark for 500ms, then dismiss sheet, THEN do the intro animation


weekend
4 reset smooth animation
x let user pick what country?
x let user send to bank account
x change BTC to earnings
x make activity work
x make earning work
3 let user scroll home screen and debit card
x let user withdraw to crypto
x have disabled state for no op options when hover over group
x change sheet to normal sheet from auth
- do 1 reskin
x sign in to add money doesn't go to home screen
x goin back to sign in is abrupt, is there a smooth transition you can do?
x timer is weird, sometimes stuck at 13 seconds and doesn't change for a while. 
- make adding bank or recipient go straight to the amount field



also make input field the same as the input field from the phone and email auth screens. flags should be 20px inside the icon tile in the lists. the list is too wide and not respecting full width and right side padding. we should also put like 5 most popular by volume at the top, then all countries at the bottom. then you should be able to search via currency code as well. also let the list container extend beyond bottom of screen instead of clipping it contained and having it scroll inside the container. you should be able to scroll inside the sheet. put a progressive blur + gradient mask (same color as sheet bg) kind of like we do for the faceIDAuth. the buttons and header sit on top of this blur. then the content can scroll underneath. also the space between the header and the bank list container should be the same as the "Add money from" screen. right now the Bank account screen has too much gap between the header and the list container. ask me questions if you're unsure about everything.
the add bank account screen with the details, i think we need the fields to be input fields that are already prefilled, no? i think you can keep the styling as is, like  they're still input fields but they look like the fee details table from the confirm pages, just with label stacked. like the border shouldn't go all the way, there's like an indent on the left.
add bank account CTA should be the blue one, and anchored at the bottom with 32px padding all around.
make sure you reused as much as you can and not duplicating code. please architect this well.


things to follow up with dhruv
- quotes/FX using real grid api

x when you changed the blur fade... the top corners radius got clobbered. it looked great before. now there's sharp edges top corners, no radii. also the blur needs to start from the very top. i see there's like buffer of solid color. that's not right.


we should change the bitcoin card to earnings. it should look like this (just placeholder numbers in the screenshot). weekly activity detail number  turns into spent instead of earned