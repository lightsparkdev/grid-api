"""Grid's quote arithmetic, reimplemented so quotes can be checked against it.

Ported from webdev/sparkcore/sparkcore/money/quote.py. Only the MARKDOWN branch
is here: every fee structure a Striga platform resolves is MARKDOWN, and Quote
refuses to mix the two types anyway.

    fee          = fixed + round((source - fixed) * v)
    destination  = round((source - fixed) * (1 - v) * fx)
    source       = round(destination / (fx * (1 - v)) + fixed)

Rounding is ROUND_HALF_EVEN, applied to each fee component independently.
"""

from __future__ import annotations

from decimal import ROUND_HALF_EVEN, Decimal
from typing import Iterable, NamedTuple

MINOR_EXPONENT = {"EUR": 2, "USD": 2, "MXN": 2, "USDC": 6, "USDT": 6, "BTC": 8}


def round_half_even(value: Decimal) -> int:
    return int(value.quantize(Decimal(1), rounding=ROUND_HALF_EVEN))


def fee_from_source(source: int, fixed: int, variable: Decimal) -> int:
    """Total fee for a source-locked quote, components rounded independently."""
    return fixed + round_half_even((Decimal(source) - fixed) * variable)


def destination_from_source(
    source: int, fixed: int, variable: Decimal, fx: Decimal
) -> int:
    return round_half_even((Decimal(source) - fixed) * (1 - variable) * fx)


def source_from_destination(
    destination: int, fixed: int, variable: Decimal, fx: Decimal
) -> int:
    return round_half_even(Decimal(destination) / (fx * (1 - variable)) + fixed)


def fee_from_destination(
    destination: int, fixed: int, variable: Decimal, fx: Decimal
) -> int:
    source_minus_fixed = Decimal(destination) / (fx * (1 - variable))
    return fixed + round_half_even(source_minus_fixed * variable)


class FeeFit(NamedTuple):
    """A (fixed, variable) fee structure fitted to observed quotes.

    fee is linear in source: fee = fixed*(1 - v) + source*v, so the slope is v
    and the intercept is fixed*(1 - v). max_residual is the largest absolute
    difference between an observed fee and the fitted one, in minor units. A
    well-formed fee structure fits with a residual under 1.
    """

    fixed: Decimal
    variable: Decimal
    max_residual: Decimal
    points: int


def fit_fee_structure(observations: Iterable[tuple[int, int]]) -> FeeFit | None:
    """Least-squares fit of fee = a + b*source over (source, fee) pairs."""
    points = [(Decimal(s), Decimal(f)) for s, f in observations]
    n = len(points)
    if n < 2:
        return None
    sum_x = sum(p[0] for p in points)
    sum_y = sum(p[1] for p in points)
    sum_xx = sum(p[0] * p[0] for p in points)
    sum_xy = sum(p[0] * p[1] for p in points)
    denominator = n * sum_xx - sum_x * sum_x
    if denominator == 0:
        return None
    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n
    variable = slope
    fixed = intercept / (1 - variable) if variable != 1 else Decimal(0)
    max_residual = max(abs(y - (intercept + slope * x)) for x, y in points)
    return FeeFit(fixed=fixed, variable=variable, max_residual=max_residual, points=n)


def reported_exchange_rate(
    sending: int, receiving: int, fees: int, source_currency: str, destination_currency: str
) -> Decimal | None:
    """`Quote.exchangeRate` as the API defines it: sending currency units per
    receiving currency unit, in MAJOR units, net of fees."""
    if receiving == 0:
        return None
    source_exponent = MINOR_EXPONENT.get(source_currency)
    destination_exponent = MINOR_EXPONENT.get(destination_currency)
    if source_exponent is None or destination_exponent is None:
        return None
    net_source_major = (Decimal(sending) - fees) / (Decimal(10) ** source_exponent)
    receiving_major = Decimal(receiving) / (Decimal(10) ** destination_exponent)
    return net_source_major / receiving_major


def striga_representable(amount: int, currency: str, multiplier: int) -> bool:
    """Whether grid can hand this amount to Striga at all.

    _to_striga_minor_amount raises rather than truncating when an amount is
    finer than Striga's minor unit, so a fee that fails this can never be
    collected as an override.
    """
    return multiplier <= 1 or amount % multiplier == 0
