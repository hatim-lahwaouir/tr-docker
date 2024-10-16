# Generated by Django 4.2.16 on 2024-10-11 10:39

import Models.models
from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('full_name', models.CharField(max_length=50)),
                ('username', models.CharField(max_length=30)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('level', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('fract_level', models.DecimalField(decimal_places=2, default=0.0, max_digits=1000)),
                ('games', models.IntegerField(default=0)),
                ('wins', models.IntegerField(default=0)),
                ('ready', models.BooleanField(default=False)),
                ('online', models.BooleanField(default=False)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('sentInvite', models.BooleanField(default=False)),
                ('profile_img', models.ImageField(default='default.jpg', upload_to=Models.models.upload_to, validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg'])])),
                ('dark_mode', models.BooleanField(default=True)),
                ('valid_email', models.BooleanField(default=False)),
                ('trAlias', models.CharField(default='x', max_length=30)),
                ('trRound', models.IntegerField(default=1)),
                ('PositionR1', models.IntegerField(default=1)),
                ('PositionR2', models.IntegerField(default=1)),
                ('isInTournament', models.BooleanField(default=False)),
                ('isInGame', models.BooleanField(default=False)),
                ('ballc', models.CharField(default='FFFFFF', max_length=7)),
                ('paddlec', models.CharField(default='FFFFFF', max_length=7)),
                ('tablec', models.CharField(default='000000', max_length=7)),
                ('s_game_option', models.CharField(choices=[('1', '1'), ('2', '2')], default='1', max_length=1)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Two_FA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('choice', models.CharField(choices=[('SE', 'send_email'), ('AA', ' authenticator_app'), ('NONE', 'None')], default='SE', max_length=4)),
                ('key', models.CharField(blank=True, default='pyotp.random_base32', max_length=32)),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now)),
                ('expired_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='my_2FA', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_of_notification', models.DateTimeField(default=django.utils.timezone.now)),
                ('content', models.TextField(default='')),
                ('seen', models.BooleanField(default=False)),
                ('receiver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='my_notifications', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_notifications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Messages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('seen', models.BooleanField(default=False)),
                ('content', models.TextField()),
                ('date_of_message', models.DateTimeField(auto_now_add=True)),
                ('receiver', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_messages', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_messages', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_of_game', models.DateTimeField(default=django.utils.timezone.now)),
                ('winner_score', models.PositiveIntegerField()),
                ('loser_score', models.PositiveIntegerField()),
                ('loser', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='my_lost_games', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='my_won_games', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='FriendshipStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(default='PE', max_length=2)),
                ('receiver', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='received_RS', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sent_RS', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ForgetPassword',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(default='', max_length=32)),
                ('url', models.CharField(default='', max_length=100)),
                ('code_expired_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('url_expired_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='forgetPassword', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='friendshipstatus',
            constraint=models.UniqueConstraint(fields=('receiver', 'sender'), name='unique_friendshipStatus'),
        ),
        migrations.AlterUniqueTogether(
            name='friendshipstatus',
            unique_together={('receiver', 'sender')},
        ),
    ]
