<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/..')
    ->name('*.php')
    ->notPath('vendor')
    ->notPath('node_modules');

return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        'array_indentation' => true,
        'array_syntax' => ['syntax' => 'short'],
        'indentation_type' => true,
        'no_whitespace_in_blank_line' => true,
        'no_trailing_whitespace_in_comment' => true,
        'no_trailing_whitespace' => true,
        'no_extra_blank_lines' => true,
        'trailing_comma_in_multiline' => ['elements' => ['arrays', 'arguments', 'parameters']],
        'single_quote' => true,
        'no_empty_statement' => true,
        'no_extra_blank_lines' => true,
        'no_multiline_whitespace_around_double_arrow' => true,
        'multiline_whitespace_before_semicolons' => true,
        'no_singleline_whitespace_before_semicolons' => true,
        'single_space_after_construct' => true,
        'types_spaces' => ['space' => 'single'],
        'no_unused_imports' => true,
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'single_line_after_imports' => true,
        'blank_line_before_statement' => [
            'statements' => ['break', 'continue', 'declare', 'return', 'throw', 'try'],
        ],
    ])
    ->setFinder($finder);
