# Generated by Django 4.2.16 on 2024-10-06 08:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('second_game', '0002_rename_game_sgame'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sgame',
            old_name='player1',
            new_name='p1',
        ),
        migrations.RenameField(
            model_name='sgame',
            old_name='player2',
            new_name='p2',
        ),
    ]
