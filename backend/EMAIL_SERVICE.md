# Email Service Integration - Postmark

## Estrutura de Arquivos

```
backend/
├── config/
│   └── email-config.php          # Configurações centralizadas de email
├── services/
│   └── EmailService.php          # Serviço principal de envio de emails
└── templates/
    └── emails/
        ├── admin-quote-notification.php        # Template HTML para admin
        ├── admin-quote-notification-text.php   # Template texto para admin
        ├── customer-quote-confirmation.php     # Template HTML para cliente
        └── customer-quote-confirmation-text.php # Template texto para cliente
```

## Configuração

### 1. Instalar Dependências

```bash
composer install
```

Isso instalará:

- `wildbit/postmark-php` - SDK oficial do Postmark

### 2. Configurar Chave API

No WordPress Admin, vá para **Calculadora de Armários → Settings** e configure:

- **Postmark API Key**: Sua chave de API do Postmark
- **Admin Email**: Email que receberá as cotações
- **From Email**: Email remetente (deve estar verificado no Postmark)

## Uso

### Enviando Emails

```php
use BluePrintCabinets\CabinetsCalculator\Services\EmailService;

$email_service = new EmailService();

// Verificar se está configurado
if ($email_service->is_configured()) {
    // Enviar notificação para admin
    $admin_sent = $email_service->send_admin_notification($quote_data);

    // Enviar confirmação para cliente
    $customer_sent = $email_service->send_customer_confirmation($quote_data);
}
```

### Estrutura de Dados

```php
$quote_data = [
    'customerInfo' => [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '555-1234',
        'preferredContact' => 'email',
        'notes' => 'Additional notes...'
    ],
    'layoutType' => 'l-shape',
    'linearFeet' => 24,
    'ceilingConfig' => '8ft-crown',
    'hasIsland' => true,
    'islandDimensions' => [
        'length' => 6,
        'width' => 3
    ],
    'estimate' => [
        'cabinet' => [
            'linearFeet' => 24,
            'pricePerFoot' => 401,
            'subtotalLow' => 8000,
            'subtotalHigh' => 10000
        ],
        'island' => [
            'dimensions' => '6ft × 3ft',
            'price' => 4500
        ],
        'total' => [
            'low' => 12500,
            'high' => 14500
        ]
    ]
];
```

## Personalização de Templates

### Criar Novo Template

1. Crie um arquivo PHP em `backend/templates/emails/`
2. Use as variáveis disponíveis via `extract($data)`
3. Sempre use `esc_html()` e `esc_attr()` para segurança

Exemplo:

```php
<?php
// backend/templates/emails/my-template.php
if (!defined('ABSPATH')) exit;
?>
<html>
<body>
    <h1>Hello <?php echo esc_html($customerInfo['name']); ?>!</h1>
</body>
</html>
```

### Usar Template Personalizado

```php
$email_service = new EmailService();
$html = $email_service->template_loader->render('my-template', $data);
```

## Configurações Avançadas

Edite `backend/config/email-config.php` para personalizar:

- Tags do Postmark (analytics)
- Assuntos dos emails
- Timeouts de API
- Tracking de aberturas e links

## Segurança

- ✅ API Key armazenada nas opções do WordPress
- ✅ Todos os outputs escapados (XSS protection)
- ✅ Validação de email
- ✅ Namespace PHP para evitar conflitos

## Debugging

Errors são logados no WordPress:

```php
// Ver logs
tail -f /path/to/wordpress/wp-content/debug.log
```

Ou ative WP_DEBUG:

```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## API do Postmark

Referência: https://postmarkapp.com/developer/api/overview

Limites:

- 100 emails/segundo (Standard Plan)
- 10 MB tamanho máximo por email
- Deve verificar domínio de envio

## Troubleshooting

### Email não está enviando

1. Verifique se a API key está configurada
2. Verifique se o email remetente está verificado no Postmark
3. Cheque os logs do WordPress
4. Teste a API key diretamente no Postmark

### Templates não aparecem

1. Verifique permissões dos arquivos (644 para arquivos, 755 para pastas)
2. Confirme que os templates estão em `backend/templates/emails/`
3. Verifique o nome do arquivo (sem a extensão .php ao chamar)

## Benefícios da Nova Estrutura

✅ **Manutenção Fácil**: Configurações e templates separados
✅ **Reutilizável**: Classes podem ser usadas em outros plugins
✅ **Testável**: Lógica isolada facilita testes
✅ **Profissional**: Usa SDK oficial do Postmark
✅ **Escalável**: Fácil adicionar novos tipos de email
✅ **Limpo**: Código principal não tem HTML inline

## Migração do Código Antigo

O código antigo que usava `wp_remote_post` diretamente foi substituído pelo SDK do Postmark. Benefícios:

- ✅ Melhor tratamento de erros
- ✅ Retry automático
- ✅ Suporte a attachments (futuro)
- ✅ Melhor documentação
- ✅ Validações automáticas
