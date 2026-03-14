from observations import join_with


def test_one_item():
    assert join_with(["A"]) == "A"


def test_two_items_and():
    assert join_with(["A", "B"], "and") == "A and B"


def test_two_items_or():
    assert join_with(["A", "B"], "or") == "A or B"


def test_three_items_and():
    assert join_with(["A", "B", "C"], "and") == "A, B, and C"


def test_three_items_or():
    assert join_with(["A", "B", "C"], "or") == "A, B, or C"


def test_four_items():
    assert join_with(["A", "B", "C", "D"], "and") == "A, B, C, and D"


def test_default_conjunction_is_and():
    assert join_with(["A", "B"]) == "A and B"
