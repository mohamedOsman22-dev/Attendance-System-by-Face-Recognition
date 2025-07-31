import { trigger, transition, style, animate, query } from '@angular/animations';

export const slideInAnimation =
  trigger('slideInAnimation', [
    transition('* <=> *', [
      query(
        ':enter, :leave',
        [
          style({
            position: 'absolute',
            width: '100%',
            left: 0,
            top: 0
          })
        ],
        { optional: true }
      ),
      query(
        ':leave',
        [
          style({ opacity: 1, transform: 'translateX(0)' }),
          animate('350ms cubic-bezier(.45,0,.55,1)', style({ opacity: 0, transform: 'translateX(-40px)' }))
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateX(40px)' }),
          animate('350ms cubic-bezier(.45,0,.55,1)', style({ opacity: 1, transform: 'translateX(0)' }))
        ],
        { optional: true }
      )
    ])
  ]);
